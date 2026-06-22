/**
 * Gemini API Services
 * Direct fetch-based client to avoid heavy SDK dependencies and version mismatches.
 */

// We default to gemini-2.5-flash as it is fast and powerful
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Streams content from the Gemini API using Server-Sent Events/ReadableStream.
 * @param {string} prompt - User query or input
 * @param {string} systemInstruction - Developer system prompt for persona behavior
 * @param {string} apiKey - Gemini API Key
 * @param {function} onChunk - Callback for each text chunk: (text) => {}
 * @param {function} onFinish - Callback when stream completes: (fullText) => {}
 * @param {function} onError - Callback when an error occurs: (error) => {}
 */
export async function streamGemini(prompt, systemInstruction, apiKey, onChunk, onFinish, onError) {
  try {
    let url;
    let headers = { "Content-Type": "application/json" };
    let body;

    if (apiKey) {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent?alt=sse&key=${apiKey}`;
      body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.5,
        }
      };
    } else {
      url = `/api/gemini-stream`;
      body = {
        prompt,
        systemInstruction
      };
    }

    const response = await fetch(
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText || response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Save the last incomplete line to the buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              fullText += textChunk;
              onChunk(textChunk);
            }
          } catch (e) {
            console.warn("Could not parse line: ", line, e);
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(buffer.slice(6).trim());
        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textChunk) {
          fullText += textChunk;
          onChunk(textChunk);
        }
      } catch (e) {
        // ignore
      }
    }

    onFinish(fullText);
  } catch (error) {
    console.error("Gemini stream error:", error);
    onError(error);
  }
}

/**
 * Fetches structured JSON data from Gemini.
 * @param {string} prompt - User query or input
 * @param {string} systemInstruction - Developer system prompt defining persona and JSON structure
 * @param {string} apiKey - Gemini API Key
 * @returns {Promise<object>} Parsed JSON object
 */
export async function generateGeminiJSON(prompt, systemInstruction, apiKey) {
  let url;
  let headers = { "Content-Type": "application/json" };
  let body;

  if (apiKey) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };
  } else {
    url = `/api/gemini-json`;
    body = {
      prompt,
      systemInstruction
    };
  }

  const response = await fetch(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errText || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text returned from Gemini API");
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", text, e);
    throw new Error("Failed to parse response as JSON. Output was: " + text.slice(0, 100));
  }
}
