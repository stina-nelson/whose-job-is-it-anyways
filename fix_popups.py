import re

# Read the file
with open('whose-job-is-it-anyways.html', 'r') as f:
    content = f.read()

# Remove the custom popups from the correct section
correct_pattern = r'(feedback\.textContent = `✅ Correct! \$\{guess\} owns "\$\{currentTask\}"`;[\s\S]*?feedback\.className = \'feedback correct\';)\s*setTimeout\(\(\) => \{[\s\S]*?if \(guess === \'Laura\'\)[\s\S]*?\}, 1000\);'
content = re.sub(correct_pattern, r'\1', content)

# Add the custom popups to the wrong section
wrong_pattern = r'(feedback\.textContent = `❌ Wrong! \$\{currentTaskObj\.owner\} owns "\$\{currentTask\}"`;[\s\S]*?feedback\.className = \'feedback incorrect\';)'
replacement = r'''\1
                
                setTimeout(() => {
                    if (guess === 'Laura') {
                        showCustomPopup("Did you just guess Laura because she's closest to you right now?");
                    } else if (guess === 'Deena') {
                        showCustomPopup("how am I supposed to live, laugh, love in these conditions?");
                    } else if (guess === 'Christina') {
                        showCustomPopup("you're killin me, smalls");
                    }
                }, 1000);'''

content = re.sub(wrong_pattern, replacement, content)

# Write back
with open('whose-job-is-it-anyways.html', 'w') as f:
    f.write(content)

print("Fixed popups!")
