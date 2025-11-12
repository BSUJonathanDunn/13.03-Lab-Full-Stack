/*Javascript file for the front end code of the page.
 *Deals with the animations, editable span elements
 *and gives a second layer of checks for blank textboxes.*/
document.addEventListener('DOMContentLoaded', () => {
  
  //Snowflakes on the page
  const snowflakeCount = 30;
  for (let i = 0; i < snowflakeCount; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    //All of this is for random page placement, flake size, and animation delays
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

    //Makes the span within the <li> element editable
    span.addEventListener('click', () => {
      span.contentEditable = true;
      span.focus();
    });

    //Function to save changes when task item is changed
    const saveChange = () => {
      span.contentEditable = false;
      const id = span.dataset.id;
      const newText = span.textContent.trim();

      //No input given
      if (!newText) {
        alert('Task cannot be blank!');
        span.textContent = span.dataset.original;
        span.focus();
        return;
      }

    //Input is same as original
    if (newText === span.dataset.original) return;

    //Updating table with new text given by user to the task list span element
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

    //Leaving the task list span element will now save changes to table
    span.addEventListener('blur', saveChange);

    //Makes it work with "Enter" key as well
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

      //call route to update completed table value
      fetch('/update_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, completed: newValue })
      })
        .then(res => {
          if (!res.ok) throw new Error('Update failed');

          span.textContent = newValue ? 'Completed' : 'Not Completed';
          span.dataset.completed = newValue;

          //Make sure correct css is placed on the "completed" span
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
