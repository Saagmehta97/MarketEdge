from app import supabase
def find_all_events(user_id):
    response = (
        supabase.table("Event_Follows").select("*").eq("user_id", user_id).execute()
    )
    return response

def find_event(event_id, user_id):
    response = (
        supabase.table("Event_Follows").select("event_id, user_id").eq("user_id", user_id).eq("event_id", event_id).execute()
    )
    print(f"find_event response: {len(response.data) > 0}")
    return len(response.data) > 0

def update_follow_event(event_id, user_id):
    response = (
        supabase.table("Event_Follows").insert({"event_id": event_id, "user_id": user_id}).execute()
    )
    print(f"update_follow_event response: {response}")
    return response
    

def unfollow_event(event_id, user_id):
    response = (
        supabase.table("Event_Follows").delete().eq("event_id", event_id).eq("user_id", user_id).execute()
    )
    print(f"unfollow_event response: {response}")
    return response