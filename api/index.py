"""
Vercel Serverless Function — exports the FastAPI app for Vercel's Python runtime.
"""
import sys
import os

# Add server directory to path
server_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server")
sys.path.insert(0, server_dir)

from main import app
