from transformers import AutoTokenizer, AutoModelForCausalLM

# Load GPT-2 model and tokenizer
MODEL_NAME = "TinyLlama/TinyLlama_v1.1"  # You can replace this with a lightweight decoder model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Function to calculate severity score using a decoder model
def calculate_severity_score_decoder(notes):
    """
    Use a decoder model with a chat-style prompt to calculate a severity score for patient notes.
    :param notes: String containing patient notes
    :return: Severity score (float) between 0 and 10
    """
    try:
        # Chat-style prompt
        prompt = (
            "Assistant: I am a medical assistant. I will help assess the severity of the patient's condition.\n"
            "User: Here are the patient notes: {notes}\n"
            "Assistant: Based on the notes provided, the severity score on a scale of 1 to 10  with less severe 1 and more being 10is:\n"
            f"Patient Notes: {notes}\n"
            "Severity Score:"
        )

        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt")

        # Generate text (use a small max_length to limit the response)
        outputs = model.generate(
            inputs["input_ids"],
            max_length=inputs["input_ids"].shape[1] + 3,  # Allow 5 tokens for the score
            num_return_sequences=1,
            do_sample=False
        )

        # Decode the generated text
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Generated Text:\n{generated_text}")

        # Extract the severity score
        score_text = generated_text.split("Severity Score:")[-1].strip()
        severity_score = float(score_text)

        # Ensure the score is within the range [0, 10]
        return max(0, min(10, severity_score))

    except Exception as e:
        print(f"Error calculating severity score: {e}")
        return None


# Example Usage
if __name__ == "__main__":
    notes_1 = "Patient reports critical pain and severe discomfort."
    notes_2 = "Patient has moderate fever and mild headaches."
    notes_3 = ""

    print(f"Notes 1 Severity Score: {calculate_severity_score_decoder(notes_1)}")
    print(f"Notes 2 Severity Score: {calculate_severity_score_decoder(notes_2)}")
    print(f"Notes 3 Severity Score: {calculate_severity_score_decoder(notes_3)}")
