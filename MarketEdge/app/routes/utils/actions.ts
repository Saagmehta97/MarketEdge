import { parseCookie } from "./loaders";

const API_CONFIG = {
    // Use environment variables or fallback to localhost
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
    endpoints: {
      sports: "/sports",
      events: "/events",
      follow: "/follow"
    }
  };

export async function sharedAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const eventId = formData.get("eventId");
    const follow = formData.get("follow") === "true";
    const cookieHeader = request.headers.get("Cookie");
    
    const token = parseCookie(cookieHeader);
  
    try {
      const formResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}${API_CONFIG.endpoints.follow}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ follow }),
      });
      if (!formResponse.ok) {
        throw new Error(`Failed to fetch form data: ${formResponse.status}`);
      }
  
  
      console.log(formResponse)
      return true
    }
    catch (error) {
      console.error("Error fetching data:", error);
      return null
    }
  }