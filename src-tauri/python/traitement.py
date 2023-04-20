import spacy

NLP=spacy.load("fr_core_news_sm")

def use_text(text:str):
    doc=NLP(text)
    for token in doc:
        print(token)
    

