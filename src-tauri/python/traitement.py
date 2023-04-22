import spacy
from spacy import displacy
from spacy.matcher import Matcher

nlp = spacy.load('en_core_web_md')


def use_text(text: str):
    doc = nlp(text)
    for token in doc:
        print(token.text, token.pos_, token.dep_)


pattern = [{"LOWER": {"IN": ["generate", "modify"]}},
           {"LOWER": "a"}, {"LOWER": "module"}, {"IS_ALPHA": True, "OP": "+"},
           {"LOWER": {"IN": ["named", "called"]}}, {"IS_ALPHA": True, "OP": "+"},
           {"LOWER": ",", "OP": "?"}, {"LOWER": "this"}, {"LOWER": "model"},
           {"LOWER": {"IN": ["lasts", "waits", "runs", "executes"]}},
           {"IS_DIGIT": True, "OP": "?"}, {"LOWER": {"IN": ["sec", "second", "minute", "hour"]}, "OP": "?"},
           {"LOWER": {"IN": ["then", "and"]}, "OP": "?"},
           {"LOWER": {"IN": ["send", "output"]}, "OP": "?"},
           {"LOWER": {"IN": ["an", "the"]}, "OP": "?"},
           {"IS_ALPHA": True, "OP": "+"}, {"LOWER": {"IN": ["!", ".", "?", "..."]}, "OP": "?"}]

matcher = Matcher(nlp.vocab)
matcher.add("Module", [pattern])


def process_match(matcher, doc, i, matches):
    match_id, start, end = matches[i]
    module_name = doc[start + 4:end - 1].text
    duration = None
    duration_unit = None
    input_text = None
    output_text = None
    for token in doc[end:]:
        if token.pos_ == "NUM":
            duration = int(token.text)
        elif token.pos_ == "NOUN" and token.text in ["second", "minute", "hour"]:
            duration_unit = token.text
        elif token.text == "infinite":
            duration = "infinite"
            break
        elif token.text in ["send", "output"]:
            output_text = token.nbor().text.strip("'\"")
        elif token.text == "passivate":
            output_text = None
    if duration is not None:
        response = f"To start, hold in {module_name} for time {duration} "
        if duration_unit is not None:
            response += duration_unit
        response += "!\n"
    else:
        response = f"To start, {module_name}!\n"
    if output_text is not None:
        response += f"After {module_name} output {output_text}!"
    return response


def input_modeling(doc):
    matches = matcher(doc)
    for match in matches:
        response = process_match(matcher, doc, 0, matches)
        doc.user_data["response"] = response
    return doc


nlp.add_pipe(input_modeling, last=True, name="input_modeling")

input_sentence = "generate a module named sendhello , this model last 1 sec then send an input 'hello'"
doc = nlp(input_sentence)
response = doc.user_data["response"]
print(response)
