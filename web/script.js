(function() {
  "use strict";

  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addTaskBtn');
  const tasksContainer = document.getElementById('tasksContainer');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const filterChips = document.querySelectorAll('.filter-chip');
  const tasksCounter = document.getElementById('tasksCounter');
  const currentDateSpan = document.getElementById('currentDate');

  let tasks = [];
  let currentFilter = 'all';   // 'all', 'active', 'completed'

  function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateSpan.textContent = now.toLocaleDateString('en-US', options);
  }
  updateDateDisplay();

  const STORAGE_KEY = 'daytasks_modern_app';

  function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        tasks = JSON.parse(stored);
      } catch (e) {
        tasks = [];
      }
    } else {
     
      tasks = [
        { id: Date.now() + 1, text: 'Review project brief', completed: false },
        { id: Date.now() + 2, text: 'Morning workout', completed: true },
        { id: Date.now() + 3, text: 'Read 20 pages', completed: false },
      ];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

 
  function renderTasks() {
    const filtered = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true; // 'all'
    });

    if (filtered.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-clipboard-list"></i>
          <p>No tasks found.<br>Add one above.</p>
        </div>
      `;
    } else {
      let html = '';
      filtered.forEach(task => {
        const checkedAttr = task.completed ? 'checked' : '';
        const completedClass = task.completed ? 'completed' : '';
        html += `
          <div class="task-item ${completedClass}" data-task-id="${task.id}">
            <input type="checkbox" class="task-check" ${checkedAttr}>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" title="Delete task"><i class="fas fa-times"></i></button>
          </div>
        `;
      });
      tasksContainer.innerHTML = html;
    }

    
    const activeCount = tasks.filter(t => !t.completed).length;
    tasksCounter.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;


    filterChips.forEach(chip => {
      const filterValue = chip.dataset.filter;
      if (filterValue === currentFilter) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    saveTasks();
  }

 
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function addNewTask() {
    const text = taskInput.value.trim();
    if (text === '') {
      taskInput.style.borderColor = '#dc3545';
      setTimeout(() => taskInput.style.borderColor = '', 300);
      return;
    }
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false
    };
    tasks.push(newTask);
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
  }

  function toggleTask(taskId, completed) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = completed;
    }
    renderTasks();
  }

  function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
  }

  tasksContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-check')) {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;
      const taskId = Number(taskItem.dataset.taskId);
      const isChecked = e.target.checked;
      toggleTask(taskId, isChecked);
    }
  });

  tasksContainer.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.task-delete');
    if (deleteBtn) {
      const taskItem = deleteBtn.closest('.task-item');
      if (taskItem) {
        const taskId = Number(taskItem.dataset.taskId);
        deleteTask(taskId);
      }
    }
  });

  addBtn.addEventListener('click', addNewTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addNewTask();
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      if (filter) {
        currentFilter = filter;
        renderTasks();
      }
    });
  });

  loadTasks();
  renderTasks();
})();
