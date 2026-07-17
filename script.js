/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace this with your Cloudflare Worker URL when you deploy it.
const workerUrl = "https://autumn-snowflake.pottere9.workers.dev/";

// A simple system prompt that keeps the assistant focused on L'Oréal topics.
const systemPrompt =
  "You are a helpful L'Oréal beauty assistant. Answer only questions about L'Oréal products, skincare routines, haircare routines, makeup, fragrances, and personalized recommendations. If the user asks about anything else, politely say you can only help with L'Oréal products and routines.";

// Add one message bubble to the chat window.
function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show a welcome message when the page loads.
addMessage(
  "👋 Hello! Ask me about L'Oréal products, routines, or recommendations.",
  "ai",
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  // Show the user's message first.
  addMessage(message, "user");
  userInput.value = "";

  // Show a temporary loading message.
  addMessage("Thinking...", "ai");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("The chatbot could not respond right now.");
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a reply.";

    // Replace the loading message with the real reply.
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.classList.contains("ai")) {
      lastMessage.textContent = reply;
    } else {
      addMessage(reply, "ai");
    }
  } catch (error) {
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.classList.contains("ai")) {
      lastMessage.textContent =
        "Sorry, I could not reach the assistant. Please try again.";
    } else {
      addMessage(
        "Sorry, I could not reach the assistant. Please try again.",
        "ai",
      );
    }
  }
});
