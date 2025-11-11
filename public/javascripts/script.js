/*Javascript file for the front end code of the page.
 *Deals with the animations, editable span elements
 *and gives a second layer of checks for blank textboxes.*/
document.addEventListener('DOMContentLoaded', () => {
  
  //Snowflakes on the page
  const snowflakeCount = 30;
  for (let i = 0; i < snowflakeCount; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + 'vw';
    flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
    flake.style.animationDuration = (Math.random() * 5 + 5) + 's';
    flake.style.animationDelay = Math.random() * 5 + 's';
    flake.textContent = '❄';
    document.body.appendChild(flake);
  }

  const taskForm = document.querySelector('form[action="/create"]');
  const taskInput = document.querySelector('#task');

  //Front-End Check for a blank task-list entry
  taskForm.addEventListener('submit', (event) => {
    if (!taskInput.value.trim()) {
      event.preventDefault();
      alert('Task cannot be blank!');
      taskInput.textContent = "";
      taskInput.focus();
    }
  });

  //Code for making the span elements editable
  const tasks = document.querySelectorAll('.task');

  //If user gives a blank box or changes their mind, save original text to the span's dataset.
 tasks.forEach(span => {
  if (!span.dataset.original) {
    span.dataset.original = span.textContent.trim();
  }

  span.addEventListener('click', () => {
    span.contentEditable = true;
    span.focus();
  });

  const saveChange = () => {
    span.contentEditable = false;
    const id = span.dataset.id;
    const newText = span.textContent.trim();

    if (!newText) {
      alert('Task cannot be blank!');
      span.textContent = span.dataset.original;
      span.focus();
      return;
    }

    if (newText === span.dataset.original) return;

    fetch('/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id, edit: newText })
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        span.dataset.original = newText;
      })
      .catch(err => {
        console.error(err);
        span.textContent = span.dataset.original;
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

  //Completion toggle
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

          span.textContent = newValue ? 'Completed' : 'Not Completed';
          span.dataset.completed = newValue;


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
