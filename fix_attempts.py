import re

with open('whose-job-is-it-anyways.html', 'r') as f:
    content = f.read()

# Fix the attempts tracking - just keep it simple
content = re.sub(r'\/\/ Track attempts at start[\s\S]*?attempts\+\+;', 'attempts++;', content)
content = re.sub(r'document\.getElementById\(\'attempts\'\)\.textContent = attempts;[\s\S]*?if \(isCorrect === currentTaskObj\.owner\)', 'document.getElementById(\'attempts\').textContent = attempts;\n            \n            if (guess === currentTaskObj.owner)', content)

with open('whose-job-is-it-anyways.html', 'w') as f:
    f.write(content)

print("Fixed attempts tracking!")
