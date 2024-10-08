import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Use Replit's environment variables if available, otherwise use .env file
url: str = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Supabase URL and key must be set in environment variables")

supabase: Client = create_client(url, key)

def setupTerribleTeddies():
    # Create terrible_teddies table
    supabase.table("terrible_teddies").insert({
        "id": "dummy",
        "name": "Dummy Bear",
        "title": "The Placeholder",
        "description": "A temporary bear for table creation",
        "attack": 1,
        "defense": 1,
        "special_move": "Vanish",
        "image_url": "https://example.com/dummy.png"
    }).execute()
    
    # Remove the dummy data
    supabase.table("terrible_teddies").delete().eq("id", "dummy").execute()

    print("Terrible Teddies table created successfully.")