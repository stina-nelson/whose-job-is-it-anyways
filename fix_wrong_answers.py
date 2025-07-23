import re

with open('whose-job-is-it-anyways.html', 'r') as f:
    content = f.read()

# Find and replace the wrong answer section
# Remove the revelation of correct answer and auto-advance
old_wrong_section = r'} else \{[\s\S]*?feedback\.textContent = `❌ Wrong! \$\{currentTaskObj\.owner\} owns "\$\{currentTask\}"`;[\s\S]*?feedback\.className = \'feedback incorrect\';[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?if \(guess === \'Laura\'\)[\s\S]*?\}, 1000\);[\s\S]*?\}'

new_wrong_section = '''} else {
                feedback.textContent = `❌ Try again!`;
                feedback.className = 'feedback incorrect';
                
                setTimeout(() => {
                    if (guess === 'Laura') {
                        showCustomPopup("Did you just guess Laura because she's closest to you right now?");
                    } else if (guess === 'Deena') {
                        showCustomPopup("how am I supposed to live, laugh, love in these conditions?");
                    } else if (guess === 'Christina') {
                        showCustomPopup("you're killin me, smalls");
                    }
                }, 1000);
                
                // Don't advance - let them guess again
                return;
            }'''

content = re.sub(old_wrong_section, new_wrong_section, content, flags=re.DOTALL)

# Also need to move the setTimeout(startNewRound, 3000) to only happen on correct answers
# Find the current setTimeout that's outside the if/else
content = re.sub(r'(\s+setTimeout\(startNewRound, 3000\);)', '', content)

# Add it only to the correct answer section
content = re.sub(r'(feedback\.className = \'feedback correct\';)', r'\1\n                \n                setTimeout(startNewRound, 3000);', content)

with open('whose-job-is-it-anyways.html', 'w') as f:
    f.write(content)

print("Fixed wrong answer behavior!")
