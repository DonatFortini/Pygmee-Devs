import spacy
from spacy.pipeline import TextCategorizer
# Define the training data
training_data = [
    ("créer un module nommé sendHello il durera 1 seconde puis il dit \"hello\"",
     "to start, hold in sendHello for time 1!\nafter sendHello output Hello!"),
    ("le module sendHello est relié au module waitforGoodMorning qui est passif pour le moment",
     "from sendHello go to waitforGoodMorning!\npassivate in waitforGoodMorning!"),
    ("ajoute la fonctionnalité suivante au module waitforGoodMorning: si on est dans le module et qu'il recoit Good morning , on se rend au module passive qui est passif",
     "when in waitforGoodMorning and receive GoodMorning go to passive!\npassivate in passive!")
]

# Load the Spacy French language model
nlp = spacy.load("fr_core_news_lg")


nlp.vocab.strings.exclusive_classes = True



textcat_config = {"exclusive_classes": True, "architecture": "simple_cnn", "labels": ["CODE_BLOCK"]}
textcat = TextCategorizer(nlp.vocab, config=textcat_config)
nlp.add_pipe(textcat)


textcat.add_label("POSITIVE")
textcat.add_label("NEGATIVE")

# Define a function to preprocess the training data


def preprocess_training_data(training_data):
    preprocessed_data = []
    for input_text, output_text in training_data:
        # Apply the Spacy pipeline to the input text
        doc = nlp(input_text)
        # Extract the lemmas of the words in the input text
        input_tokens = [
            token.lemma_ for token in doc if not token.is_punct and not token.is_stop]
        # Add the preprocessed input and output to the list
        preprocessed_data.append((input_tokens, output_text))
    return preprocessed_data


# Preprocess the training data
preprocessed_training_data = preprocess_training_data(training_data)

# Create a new text classification pipeline in the model
textcat = nlp.create_pipe("textcat", config={"exclusive_classes": True})
textcat.add_label("CODE_BLOCK")
nlp.add_pipe(textcat)

# Define the training function


def train_model(training_data, nlp, n_iter=20):
    # Get the text classification pipe from the model
    textcat = nlp.get_pipe("textcat")

    # Initialize the training optimizer
    optimizer = nlp.begin_training()

    # Loop over the training data and train the model
    for i in range(n_iter):
        losses = {}
        for input_tokens, output_text in training_data:
            # Convert the output text to a dictionary
            output_dict = {"CODE_BLOCK": True}

            # Create a Doc object from the input tokens
            doc = nlp.make_doc(" ".join(input_tokens))

            # Update the text classification model with the input tokens and output dictionary
            textcat.update([doc], [output_dict], sgd=optimizer, losses=losses)

        print("Iteration", i, "Losses", losses)

    return nlp


# Train the model
nlp = train_model(preprocessed_training_data, nlp)

# Define a function to classify user inputs


def classify_user_input(nlp, input_text):
    # Apply the Spacy pipeline to the input text
    doc = nlp(input_text)

    # Get the text classification pipe from the model
    textcat = nlp.get_pipe("textcat")

    # Get the scores for each label for the input text
    scores = textcat(doc).cats

    # Determine the label with the highest score
    label = max(scores, key=scores.get)

    # If the highest score is above a threshold, return the corresponding code block
    if scores[label] > 0.5:
        if label == "CODE_BLOCK":
            return "to start, hold in sendHello for time 1!\nafter sendHello output Hello!"

    return None


# Test the model on new user inputs
input_text = "créer un module nommé patrick il durera 20 seconde"
output = classify_user_input(nlp, input_text)
print(output)  # Output: None

input_text = "créer un module nommé sendHello il durera 1 seconde puis il dit \"hello\""
output = classify_user_input(nlp, input_text)
print(output)  # Output: to start, hold in sendHello for time 1!
# after sendHello output Hello!
