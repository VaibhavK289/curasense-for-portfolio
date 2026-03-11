import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="Medicine AI", layout="wide")

st.title("💊 Medicine AI Assistant")

menu = st.sidebar.selectbox(
    "Select Feature",
    [
        "Chat",
        "Recommendation",
        "Compare Medicines",
        "Drug Interaction",
        "Image Compare"
    ]
)

# ----------------------------
# CHAT
# ----------------------------
if menu == "Chat":

    session_id = st.text_input("Session ID", "user1")
    message = st.text_area("Your Message")

    if st.button("Send"):
        response = requests.post(
            f"{API_URL}/chat",
            json={
                "session_id": session_id,
                "message": message
            }
        )
        st.json(response.json())


# ----------------------------
# RECOMMENDATION
# ----------------------------
elif menu == "Recommendation":

    illness = st.text_area("Describe your symptoms")

    if st.button("Get Recommendation"):
        response = requests.post(
            f"{API_URL}/recommend",
            json={
                "illness_text": illness,
                "user_context": {}
            }
        )
        st.json(response.json())


# ----------------------------
# COMPARE
# ----------------------------
elif menu == "Compare Medicines":

    med1 = st.text_input("Medicine 1")
    med2 = st.text_input("Medicine 2")

    if st.button("Compare"):
        response = requests.post(
            f"{API_URL}/compare",
            json={
                "medicine_1": med1,
                "medicine_2": med2
            }
        )
        st.json(response.json())


# ----------------------------
# INTERACTION
# ----------------------------
elif menu == "Drug Interaction":

    med1 = st.text_input("Medicine 1")
    med2 = st.text_input("Medicine 2")

    if st.button("Check Interaction"):
        response = requests.post(
            f"{API_URL}/interaction",
            json={
                "medicine_1": med1,
                "medicine_2": med2
            }
        )
        st.json(response.json())


# ----------------------------
# IMAGE COMPARE
# ----------------------------
elif menu == "Image Compare":

    img1 = st.file_uploader("Upload Image 1", type=["jpg", "png"])
    img2 = st.file_uploader("Upload Image 2", type=["jpg", "png"])

    if st.button("Compare Images") and img1 and img2:
        files = {
            "image1": img1.getvalue(),
            "image2": img2.getvalue()
        }

        response = requests.post(
            f"{API_URL}/compare-images",
            files={
                "image1": img1,
                "image2": img2
            }
        )

        st.json(response.json())
