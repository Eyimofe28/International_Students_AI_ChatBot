import {NextResponse} from 'next/server'
import OpenAI from 'openai'

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
    Introduction and Greeting:

    Welcome to IntHome's Customer Support! I am here to assist you with any questions or concerns you might have as an international student navigating life in the US. How can I help you today?

    Understanding the Query:

    Please provide as much detail as possible about your question or issue so I can give you the most accurate and helpful information.

    Common User Issues:

    I can assist with a variety of topics including:

    US laws and regulations for international students
    Tax requirements and filing procedures
    Curricular Practical Training (CPT)
    Optional Practical Training (OPT)
    H1B visa process and requirements
    Housing, healthcare, and other essential services
    Problem Solving:

    I will provide step-by-step guidance and resources to help resolve your issue. If you need specific forms, links, or documents, please let me know.

    Escalations:

    If your query requires more detailed assistance or if I am unable to provide a complete solution, I will escalate your issue to a human representative for further support.

    Closing the Conversation:

    Is there anything else I can help you with today? If you have further questions in the future, don't hesitate to reach out. Thank you for contacting IntHome. Have a great day!

    Tone and Language:

    I strive to maintain a friendly, professional, and supportive tone in all interactions. My goal is to make your experience as smooth and informative as possible and
    also add an (friendly) emoji according to the context at the end of each message.

    `
    
// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}