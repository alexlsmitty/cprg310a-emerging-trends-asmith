const DEFAULT_CONFIG = {
    model: 'google/gemini-2.5-pro-exp-03-25:free', 
    fallbackModels: [
        'google/gemini-2.5-pro-exp-03-25:free',
        'deepseek/deepseek-chat-v3-0324:free', 
        'openai/gpt-4-turbo:free',
        'openai/gpt-3.5-turbo:free',
        'openai/gpt-4:free',
    ],
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
};

// --- Rate Limiting & Retry Settings ---
const rateLimitedModels = new Set(); // Stores models identified as rate-limited in this session
const MAX_RETRIES_PER_MODEL = 2; // Number of retries on a 429 before switching model
const BASE_DELAY_MS = 8000; // Increased base delay (8 seconds)
const MAX_DELAY_MS = 60000; // Max delay cap
const JITTER_MS = 1500; // Randomness added to delays

// --- Global Request Lock (Simple Version) ---
let isRequestInProgress = false;
const requestQueue = [];

// --- Helper Functions ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getNextModel = (currentModel) => {
    // Find the index of the current model in the primary + fallback list
    const allModels = [DEFAULT_CONFIG.model, ...DEFAULT_CONFIG.fallbackModels];
    // Deduplicate in case the default model is also in fallbacks
    const uniqueModels = [...new Set(allModels)];
    const currentIndex = uniqueModels.indexOf(currentModel);

    // Find the next model that isn't currently marked as rate-limited
    let nextIndex = (currentIndex + 1) % uniqueModels.length;
    let loopCounter = 0; // Prevent infinite loops if all models get marked
    while (rateLimitedModels.has(uniqueModels[nextIndex]) && loopCounter < uniqueModels.length) {
        console.log(`[getNextModel] Skipping ${uniqueModels[nextIndex]} as it's marked rate-limited.`);
        nextIndex = (nextIndex + 1) % uniqueModels.length;
        loopCounter++;
    }

     if (loopCounter === uniqueModels.length) {
         console.warn("[getNextModel] All models seem rate-limited. Returning the next one anyway.");
         // Fallback to just returning the next in sequence if all are marked
         nextIndex = (currentIndex + 1) % uniqueModels.length;
     }


    console.log(`[getNextModel] Determined next model: ${uniqueModels[nextIndex]}`);
    return uniqueModels[nextIndex];
};

// Simple queue processor
const processQueue = async () => {
    if (isRequestInProgress || requestQueue.length === 0) {
        return;
    }
    isRequestInProgress = true;
    console.log(`[Queue] Processing next request. Queue size: ${requestQueue.length}`);

    const { resolve, reject, task, taskLabel } = requestQueue.shift();
    console.log(`[Queue] Starting task: ${taskLabel}`);
    try {
        const result = await task();
        resolve(result);
        console.log(`[Queue] Task completed: ${taskLabel}`);
    } catch (error) {
        console.error(`[Queue] Task failed: ${taskLabel}`, error);
        reject(error);
    } finally {
        isRequestInProgress = false;
        const postRequestDelay = BASE_DELAY_MS / 2 + Math.random() * JITTER_MS;
        console.log(`[Queue] Waiting ${postRequestDelay.toFixed(0)}ms before next task check.`);
        await delay(postRequestDelay);
        processQueue(); // Check queue again
    }
};

// Function to add tasks to the queue
const enqueueRequest = (task, label = 'Unnamed Task') => {
    return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, task, taskLabel: label });
        console.log(`[Queue] Request enqueued: ${label}. Queue size: ${requestQueue.length}`);
        if (!isRequestInProgress) {
            processQueue();
        }
    });
};


let API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
let API_KEY = '';

export const configureLlmService = (config) => {
    console.log("[configureLlmService] Configuring with:", config);
    if (config.apiKey) {
        API_KEY = config.apiKey;
        console.log("[configureLlmService] API Key set (first 8 chars):", API_KEY.substring(0, 8));
        if (API_KEY.startsWith('sk-or-')) {
            API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
            console.log("[configureLlmService] Detected OpenRouter key, using URL:", API_BASE_URL);
        }
    } else {
        console.warn("[configureLlmService] No API key provided in config.");
    }
    // ... (rest of config updates remain the same) ...
      if (config.apiUrl) {
        API_BASE_URL = config.apiUrl;
      }
      if (config.model) DEFAULT_CONFIG.model = config.model;
      if (config.temperature !== undefined) DEFAULT_CONFIG.temperature = config.temperature;
      if (config.max_tokens !== undefined) DEFAULT_CONFIG.max_tokens = config.max_tokens;
};

// --- Core API Call Function (Handles Retries & Fallbacks) ---
const makeApiCall = async (requestBody, isStreaming = false, onChunk = null) => {
    const taskLabel = requestBody.messages?.[0]?.content?.substring(0, 50) || 'API Call'; // Short label for logging
    console.log(`[makeApiCall] Starting for task: "${taskLabel}" | Streaming: ${isStreaming}`);

    if (!API_KEY) {
        console.error("[makeApiCall] FATAL: API key is missing!");
        throw new Error('API key not configured.');
    }

    let currentModel = requestBody.model || DEFAULT_CONFIG.model;
    let totalAttempts = 0;
    const triedInThisCall = new Set();

    while (triedInThisCall.size < DEFAULT_CONFIG.fallbackModels.length + 1 && totalAttempts < 10) { // Add safety break
        totalAttempts++;
        let modelRetries = 0;

        if (triedInThisCall.has(currentModel)){
            console.log(`[makeApiCall] Model ${currentModel} already tried in this call sequence, skipping.`);
             const nextCandidate = getNextModel(currentModel);
             if (nextCandidate === currentModel) { // Safety check if getNextModel can't find another valid one
                  console.error("[makeApiCall] Cannot find another model to try. Aborting.");
                  break;
             }
             currentModel = nextCandidate;
             continue; 
        }
        triedInThisCall.add(currentModel);

        if (rateLimitedModels.has(currentModel) && triedInThisCall.size < DEFAULT_CONFIG.fallbackModels.length) {
             console.log(`[makeApiCall] Skipping known rate-limited model ${currentModel} for now.`);
             const nextCandidate = getNextModel(currentModel);
             if (nextCandidate === currentModel) {
                  console.error("[makeApiCall] Cannot find another model to try (all known limited?). Aborting.");
                  break;
             }
             currentModel = nextCandidate;
             continue;
        }

        // --- Inner Loop: Retries for the CURRENT model ---
        while (modelRetries <= MAX_RETRIES_PER_MODEL) {
            console.log(`[makeApiCall] Attempt #${totalAttempts}: Trying model [${currentModel}] (Retry ${modelRetries}/${MAX_RETRIES_PER_MODEL})`);

            try {
                 await delay(Math.random() * JITTER_MS); // Small jitter before fetch

                 console.log(`[makeApiCall] Fetching API_KEY: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'Key is missing!'}`);
                 const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { /* ... headers ... */
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`,
                        'HTTP-Referer': window.location.origin || 'http://localhost:5173',
                        'X-Title': 'TransFusion'
                    },
                    body: JSON.stringify({ ...requestBody, model: currentModel, stream: isStreaming })
                 });

                 // --- Response Handling ---
                 if (!response.ok) {
                    let errorData;
                    let errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
                    const statusCode = response.status;
                    try { errorData = await response.json(); errorMsg = errorData?.error?.message || errorMsg; } catch (e) { /* Ignore parsing error, use status text */ }

                    console.warn(`[makeApiCall] Received non-OK response (${statusCode}) for model [${currentModel}]: ${errorMsg}`);

                    if (statusCode === 401) { // Unauthorized
                         console.error("[makeApiCall] FATAL: Authorization failed (401). Check API Key.");
                         throw new Error("AUTHORIZATION_FAILED: Invalid or missing API Key."); // Stop immediately
                    }

                    if (statusCode === 429) { // Rate Limit
                        modelRetries++;
                        if (modelRetries > MAX_RETRIES_PER_MODEL) {
                            console.warn(`[makeApiCall] Rate limit MAX retries (${MAX_RETRIES_PER_MODEL}) exceeded for model [${currentModel}]. Marking as limited for this session.`);
                            rateLimitedModels.add(currentModel);
                            break; // Break INNER loop (retries) to switch model
                        }
                        const backoffDelay = Math.min(BASE_DELAY_MS * Math.pow(2, modelRetries -1), MAX_DELAY_MS) + Math.random() * JITTER_MS;
                        console.log(`[makeApiCall] Rate limit: Retrying model [${currentModel}] after ${(backoffDelay / 1000).toFixed(1)}s...`);
                        await delay(backoffDelay);
                        continue; // Continue INNER loop (retry same model)
                    } else { // Other server/client errors (5xx, 4xx)
                        console.error(`[makeApiCall] Non-429 Error (${statusCode}) for model [${currentModel}]. Trying next model.`);
                        break; // Break INNER loop to switch model immediately
                    }
                 }

                 // --- SUCCESS ---
                 console.log(`[makeApiCall] Successful response received from model [${currentModel}].`);
                 rateLimitedModels.delete(currentModel); // Clear rate limit status on success

                 if (isStreaming) {
                    return await handleStreamingResponse(response);
                 } else {
                    const data = await response.json();
                     if (data.choices?.[0]?.message?.content) {
                        return data.choices[0].message.content;
                    } else if (data.error) {
                        console.error(`[makeApiCall] API returned OK but with error payload for [${currentModel}]:`, data.error.message);
                        break; // Break INNER loop, try next model
                    } else {
                        console.warn(`[makeApiCall] Unexpected successful response format for [${currentModel}]:`, data);
                        return JSON.stringify(data); // Return raw JSON as fallback
                    }
                 }

            } catch (error) {
                 // Network errors etc.
                 console.error(`[makeApiCall] Network or processing error during fetch for model [${currentModel}]:`, error);
                 // Don't retry the same model on network errors, switch model
                 modelRetries = MAX_RETRIES_PER_MODEL + 1; // Force break inner loop
                 await delay(1000 + Math.random() * JITTER_MS); // Wait a bit before next model
                 break; // Break INNER loop
            }
        } // End of inner loop (model retries)

        // --- Switch Model ---
        const previousModel = currentModel;
        currentModel = getNextModel(currentModel);
        if (currentModel === previousModel) {
            console.error("[makeApiCall] Could not get a different model. Stopping attempts.");
            break; // Avoid infinite loop if getNextModel keeps returning the same one
        }
        console.log(`[makeApiCall] Switching model from [${previousModel}] to [${currentModel}]`);

         // Optional: Add extra delay if cycling through all models
         if (triedInThisCall.size >= DEFAULT_CONFIG.fallbackModels.length) {
             console.warn("[makeApiCall] Cycled through all models once. Adding extra delay.");
             await delay(BASE_DELAY_MS + Math.random() * JITTER_MS);
         }

    } 

    console.error("[makeApiCall] Failed to get a successful response after all attempts and fallbacks.");
    throw new Error("API_CALL_FAILED: Unable to get response from service.");
};



const handleStreamingResponse = async (response /* removed onChunk */) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = ''; // Accumulate internally
    let streamContainsError = null;

    console.log("[handleStreamingResponse] Started processing stream.");

    try { // Wrap stream reading in try/finally to ensure reader release
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("[handleStreamingResponse] Stream finished.");
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                        if (data) {
                            const json = JSON.parse(data);
                            // Error Detection Logic (keep as is)
                            if (json.error || json.detail?.error) {
                                const errorMsg = json.error?.message || json.detail?.error?.message || 'Error object in stream';
                                console.error("[handleStreamingResponse] Explicit error object received:", errorMsg, json);
                                streamContainsError = errorMsg;
                                await reader.cancel('Error detected in stream');
                                break;
                            }

                            // Process normal content chunk
                            let content = json.choices?.[0]?.delta?.content || json.choices?.[0]?.text || '';
                            if (content) {
                                fullResponse += content; // Append to internal accumulator
                                // *** Removed onChunk(content) call ***
                            } else {
                                 if (!json.error && !json.detail?.error) {
                                    console.log('[handleStreamingResponse] Stream chunk structure (no content/error):', JSON.stringify(json));
                                 }
                            }
                        }
                    } catch (err) {
                        console.warn('[handleStreamingResponse] Error parsing JSON:', err, 'Raw data:', data);
                         if (typeof data === 'string' && data.toLowerCase().includes('provider returned error')) {
                            console.error("[handleStreamingResponse] Detected 'Provider returned error' string.");
                            streamContainsError = 'Provider returned error (from raw stream data)';
                            await reader.cancel('Provider error detected in stream');
                            break;
                         }
                    }
                }
            }
            if (streamContainsError) break; // Exit while loop if error detected
        }
    } finally {
         // Ensure the reader is released even if errors occur during processing
         if (!reader.closed) {
             try { await reader.cancel('Stream processing complete or aborted'); } catch (e) { console.warn("Error cancelling reader:", e); }
         }
         console.log("[handleStreamingResponse] Reader released.");
    }


    if (streamContainsError) {
        console.error(`[handleStreamingResponse] Throwing error detected in stream: ${streamContainsError}`);
        throw new Error(streamContainsError);
    }

     if (!fullResponse) {
         console.warn("[handleStreamingResponse] Stream finished, but no content was accumulated.");
     }

    console.log(`[handleStreamingResponse] Accumulated ${fullResponse.length} characters successfully.`);
    return fullResponse; // Return the final accumulated string
};

export const sendPrompt = (prompt, context = null, options = {}) => {
    return enqueueRequest(() => {
      const requestBody = { 
        ...DEFAULT_CONFIG,
        ...options,
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: context || 'Please process the above instructions.' }
        ],
        stream: false,
        transforms: ["middle-out"],
        route: "fallback"
      };
      return makeApiCall(requestBody, false);
    }, `sendPrompt: ${prompt.substring(0,30)}`);
};

export const sendPromptStreaming = (prompt, context = null, options = {}) => {
    
     return enqueueRequest(() => {
        const requestBody = { 
            ...DEFAULT_CONFIG,
            ...options,
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: context || 'Please process the above instructions.' }
            ],
            stream: true,
            transforms: ["middle-out"],
            route: "fallback"
        };
         return makeApiCall(requestBody, true, onChunk);
     }, `sendPromptStreaming: ${prompt.substring(0,30)}`);
};

export const translateFile = async (promptData, onProgress = null) => {
    const instruction = promptData.instruction;
    const content = promptData.content;
    const label = `translateFile: ${promptData.instruction.substring(12, 42)}`; // Extract file path

    console.log(`[translateFile] Queueing: ${label}. Instruction: ${instruction.length}, Content: ${content?.length ?? 'N/A'}`);

    try {
        const fullTranslatedContent = await sendPromptStreaming(
            instruction,
            content,
            // null, // No longer passing onChunk
            { temperature: 0 }, // Options
            label // Pass the label for better queue logging
        );
        return fullTranslatedContent; // Return the complete result

    } catch (error) {
        console.error(`[translateFile] Error for ${label}:`, error);
        if (error.message.startsWith("RATE_LIMIT_ALL") || error.message.startsWith("AUTHORIZATION_FAILED")) {
            throw error; // Re-throw critical errors
        }
        // Return an error placeholder if needed
        return `// TRANSLATION FAILED: ${error.message}\n// Could not translate this file`;
    }
};

export const getArchitectureRecommendations = async (prompt) => {
    console.log("[getArch] Queueing recommendations request.");
    return await sendPrompt(prompt, null, { temperature: 0.3 }, 'getArchitectureRecommendations');
};

export const createTranslationPlan = async (prompt, onProgress = null) => {
    console.log("[createPlan] Queueing translation plan request.");
    const label = 'createTranslationPlan';
    if (onProgress) {
         let planContent = '';
         await sendPromptStreaming(prompt, null, (chunk) => {
             planContent += chunk;
             onProgress(planContent);
         }, { temperature: 0.3 }, label);
         return planContent;
    } else {
        return await sendPrompt(prompt, null, { temperature: 0.3 }, label);
    }
};