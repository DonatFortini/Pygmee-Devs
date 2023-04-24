import re

motcle = {
    "darkmagenta": ["to", "accepts", "input", "on", "generates", "output", "start,", "hold",
                    "in", "for", "time", "after", "from", "go", "passivate", "when", "and",
                    "receive", "the", "perspective", "is", "made", "of", "sends"]
}


def formater(filename: str) -> str:
    """la fonction ouvre le fichier lit son contenu et colore le code en fonction 
    des mot clé fournis au préalable"""
    with open(filename, 'r') as file:
        content = file.read()

    sentences = re.split(r'(\!|\?|\.)\s', content)

    html_sentences = []
    for i in range(0, len(sentences), 2):
        sentence = sentences[i]
        if i + 1 < len(sentences):
            end_punct = sentences[i + 1]
        else:
            end_punct = ""
        html_words = []
        words = sentence.split()
        for word in words:
            for color, value in motcle.items():
                if word.lower() in value:
                    html_words.append(
                        f'<span style="color: {color};">{word}</span>')
                    break
            else:
                if word.isdigit():
                    html_words.append(
                        f'<span style="color:green;">{word}</span>')
                else:
                    html_words.append(word)
        html_sentence = ' '.join(html_words) + end_punct
        html_sentences.append(html_sentence)

    html_content = '<br>'.join(html_sentences)
    return html_content
