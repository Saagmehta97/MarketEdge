def get_user:
    response = (
    supabase.table("user").select("*").execute()
)
    return response



