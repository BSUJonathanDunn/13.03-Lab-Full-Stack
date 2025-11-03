document.addEventListener('DOMContentLoaded', () => {
    const snowflakeCount = 30; // number of snowflakes
  for (let i = 0; i < snowflakeCount; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + 'vw'; // random horizontal start
    flake.style.fontSize = (Math.random() * 10 + 10) + 'px'; // random size
    flake.style.animationDuration = (Math.random() * 5 + 5) + 's'; // random fall duration
    flake.style.animationDelay = Math.random() * 5 + 's'; // random delay
    flake.textContent = '❄'; // snowflake character
    document.body.appendChild(flake);
  }  
  const taskForm = document.querySelector('form[action="/create"]');
  const taskInput = document.querySelector('#task');

  taskForm.addEventListener('submit', (e) => {
    if (!taskInput.value.trim()) {
      e.preventDefault();
      alert('Task cannot be blank!');
      taskInput.focus();
    }
  });

  const tasks = document.querySelectorAll('.task');

  tasks.forEach(span => {
    const originalText = span.textContent.trim();

    // Enable editing on click
    span.addEventListener('click', () => {
      span.contentEditable = true;
      span.focus();
    });

    // Save changes when editing ends
    const saveChange = () => {
      span.contentEditable = false;
      const id = span.dataset.id;
      const newText = span.textContent.trim();

      if (!newText) {
        alert('Task cannot be blank!');
        span.textContent = originalText;
        return;
      }

      if (newText === originalText) return;

      fetch('/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, edit: newText })
      })
        .then(res => {
          if (!res.ok) throw new Error('Update failed');
          console.log(`Task ${id} updated`);
        })
        .catch(err => {
          console.error(err);
          span.textContent = originalText;
        });
    };

    span.addEventListener('blur', saveChange);
    span.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        span.blur();
      }
    });
  });

  // Handle completion toggling
  const completedSpans = document.querySelectorAll('.complete');
  completedSpans.forEach(span => {
    span.addEventListener('click', () => {
      const id = span.dataset.id;
      const completedValue = Number(span.dataset.completed);
      const newValue = completedValue > 0 ? 0 : 1;

      fetch('/update_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, completed: newValue })
      })
        .then(res => {
          if (!res.ok) throw new Error('Update failed');

          // Update the complete span text and data attribute
          span.textContent = newValue ? 'Completed' : 'Not Completed';
          span.dataset.completed = newValue;

          // Update the corresponding task span with completed class
          const taskSpan = document.querySelector(`.task[data-id="${id}"]`);
          if (newValue) {
            taskSpan.classList.add('completed');
          } else {
            taskSpan.classList.remove('completed');
          }

          console.log(`Task ${id} completion updated`);
        })
        .catch(err => {
          console.error(err);
        });
    });
  });
});
