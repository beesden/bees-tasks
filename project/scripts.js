/**
 *
 * Add, view and remove tasks using the HTML5 local storage API.
 * Tasks consist of a title and a content. They are saved against a unique timestamp key as JSON strings.
 * Both inputs allow HTML elements to be written inline.
 *
 * @constructor 
 */ 
 var taskman = (function (d) {

	/*
	 * @name	opt
	 * @type	{Array}
	 * @desc	Default options object used by the task manager
	*/
	var opt = {
		containerId: 'layoutContainer',
		formId: 'addTask',
		taskContainerId: 'layoutTasks',
		taskPrefix: 'task-'
	};

	/*
	 * @name	deleteTask
	 * @type	{Function}
	 * @desc	Remove a 'task' from local storage
	 * @param	{Integer} taskId - ID of the target task to remove
	*/
	function deleteTask(taskId) {

		// Remove the task if it exists
		if (!localStorage.getItem(taskId)) {
			throw new Error('Unable to find task with the following id: ' + taskId);
		}
		localStorage.removeItem(taskId);

		// If there is an article created, remove this too
		var article = d.getElementById(opt.taskPrefix + taskId);
		if (!article) {
			throw new Error('Unable to find task with the following id: ' + taskId);
		}
		// Use CSS animation if possible
		if (article && 'transition' in d.body.style) {
			article.style.opacity = 0;
			article.addEventListener('transitionend', function() {
				this.remove();
			});
		} else {
			article.remove();
		}		
	}

	/*
	 * @name	displayTask
	 * @type	{Function}
	 * @desc	Fetch a task and render it in HTML elements within a predefined wrapper object
	 * @param	{Integer} taskId - ID of the target task to display
	 * @param	{Object} wrapper - Object in which to append the task
	*/
	function displayTask(taskId, wrapper) {
		var article = d.createElement('article'),
			heading = d.createElement('h2'),
			content = d.createElement('p'),
			action = d.createElement('div'),
			editLink = d.createElement('a'),
			removeLink = d.createElement('a'),
			task = localStorage.getItem(taskId);

		try{
			task = JSON.parse(task);
		} catch(e) {
			deleteTask(taskId);
			throw new Error('Removing unparseable task with id: ' + taskId);
		}

		// Throw error if no task or wrapper found
		wrapper = wrapper || d.getElementById(opt.taskContainerId);
		if (!task || !wrapper) {
			throw new Error('Unable to find task with id: ' + taskId);
		}

		// Assemble the output HTML
		article.id = opt.taskPrefix + taskId;
		heading.innerHTML = task.title;
		content.innerHTML = task.content;

		// Assemble the actions
		action.className = 'action';
		removeLink.className = 'removeTask';
		removeLink.href = '#';
		removeLink.innerHTML = 'Delete';
		removeLink.onclick = function() {
			deleteTask(taskId);
		};

		// Append all the elements onto the page
		wrapper.appendChild(article);
		article.appendChild(heading);
		article.appendChild(content);
		article.appendChild(action);
		action.appendChild(editLink);
		action.appendChild(removeLink);

		/* Minute delay to allow CSS transition to work, if available */
		setTimeout(function() {
			article.style.opacity = 1;
		}, 10);
	}

	/*
	 * @name	saveTask
	 * @type	{Function}
	 * @desc	Validate and add a task into the local storage with a unique identifier
	 * @param	{Object} task - Task object (preferably JSON or similar) which to add. 
	 * @param	{Object} wrapper - Object in which to append the task
	*/
	function saveTask(task, wrapper) {
		if (!task.title) {
			return "Please enter a title";
		}
		task.id = task.id || new Date().getTime();
		localStorage.setItem(task.id, JSON.stringify(task));
		if (wrapper) {
			displayTask(task.id, wrapper);
		}
	}

	/*
	 * @name	formSubmit
	 * @type	{Function}
	 * @desc	Create a task using a specific form. 
	 * @param	{Object} form - Object in which to append the task
	 * @param	{Object} wrapper - Task object (preferably JSON or similar) which to add. 
	*/
	function formSubmit(form, wrapper) {
		var messageWrap = d.createElement('p'),
			errors,
			task;

		// Check if the form and wrapper exist
		wrapper = wrapper || d.getElementById(opt.taskContainerId);
		if (!form || !wrapper) {
			throw new Error('Unable to find either a valid form or a valid wrapper');
		}

		// Posting the form will result in a task being created. We can add additional fields here later, if required
		form.onsubmit = function(e) {
			e.preventDefault();
			task = {"id": form.id.value, "title": form.title.value, "content": form.content.value, "created": new Date()};
			errors = saveTask(task, wrapper);

			// Show error / success message
			if (errors) {
				messageWrap.innerHTML = errors;
				messageWrap.className = 'layoutErrors';
			} else {
				messageWrap.innerHTML = 'A new task has been successfully created';
				messageWrap.className = 'layoutMessages';
			}
			form.appendChild(messageWrap);
		};
	}

	return {
		/*
		 * @name	init
		 * @type	{Function}
		 * @desc	Initialised the task manager
		 * @param	{Object} options - Used to override the default options
		*/
		init: function (options) {
			var container = d.getElementById([opt.containerId]),
				form = d.forms[opt.formId],
				taskWrapper = d.createElement('div'),
				item;

			// Extend the default options
			for (item in options) {
				opt[item] = options[item];
			}
			
			// Abort script if either container or form are missing
			if (!container) {
				throw new Error('Main container not found, unable to proceed');
			}

			// Add classes and dom structure
			taskWrapper.id = opt.taskContainerId;
			container.appendChild(taskWrapper);

			// Display existing tasks from local storage
			for (item in localStorage) {
				displayTask(item, taskWrapper);
			}

			// Load the form functionality
			if (!form) {
				throw new Error('Unable to find the specified form, unable to proceed');
			}
			formSubmit(form, taskWrapper);
		},
		// Expose private functions to the outside world
		add: saveTask,
		get: displayTask,
		remove: deleteTask
	};

}(document));


window.onload = function() {
	// Demonstrate adding a sample task via the API - we wouldn't want an empty screen after all
	taskman.add({
		'id': '01', 
		'title':'Lorem ipsum <em>dolor sit amet</em>',
		'content':'<strong>Nullam sit amet orci</strong> sed nisi suscipit pharetra id libero. Nulla orci nunc, fringilla id enim sit amet, vehicula suscipit nisi. Nulla facilisi'
	});

	// Initiate the task manager
	taskman.init(
		{taskPrefix: "myTask-"}
	);
};