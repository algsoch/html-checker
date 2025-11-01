from main import clean_html_content

test = 'Test [cite: 105-107] content'
result = clean_html_content(test)

print(f'Input: {test}')
print(f'Output: {result}')
print(f'Citation removed: {"[cite: 105-107]" not in result}')
