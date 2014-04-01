var taskman = (function (d) {

	function displayTask(wrapper, title) {
		var article = d.createElement('article'),
			heading = d.createElement('h2'),
			content = d.createElement('p'),
			action = d.createElement('div'),
			removeLink = d.createElement('a');

		/* Fill the elements */
		heading.innerHTML = title;
		content.innerHTML = localStorage.getItem(title);
		removeLink.innerHTML = 'Delete';
		removeLink.onclick = function() {
			deleteTask(title, article);
		};
		action.className = 'action';

		/* Add to the page */
		wrapper.appendChild(article);
		article.appendChild(heading);
		article.appendChild(content);
		article.appendChild(action);
		action.appendChild(removeLink);

		/* Fade in with CSS. Will just appear if transition unsupported */
		setTimeout(function() {
			article.style.opacity = 1;
		}, 10);
	}

	function addTask(wrapper, title, content) {
		if (!title || !content) {
			return "Please enter something in each of the fields";
		}
		if (localStorage.getItem(title)) {
			return "An entry with that title already exists";
		} 
		localStorage.setItem(title, content);
		displayTask(wrapper, title);
	}

	function deleteTask(title, article) {
		localStorage.removeItem(title);
		/* Fade out with CSS if possible */
		if (article && 'transition' in d.body.style) {
			article.style.opacity = 0;
			article.addEventListener('transitionend', function() {
				this.remove();
			});
		} else {
			article.remove();
		}
		
	}

	return {
		/* Create a new task on form submssion */
		formSubmit: function (form) {
			var container = d.getElementById('layoutContainer'),
				taskWrapper = d.createElement('div'),
				errorWrap = d.createElement('p'),
				errors,
				item;

			form = form || d.forms.addTask;
			if (!container || !form) {
				return;
			}

			/* Link elements to CSS */
			errorWrap.className = 'layoutErrors';
			taskWrapper.className += 'layoutTasks';
			container.appendChild(taskWrapper);
			/* Generate tasks from localstorage */
			for (item in localStorage) {
				displayTask(taskWrapper, item);
			}

			form.onsubmit = function() {
				errors = addTask(taskWrapper, form.title.value, form.content.value);
				if (errors) {
					errorWrap.innerHTML = errors;
					form.appendChild(errorWrap);
				} else {
					errorWrap.remove();
				}
				return false;
			};
		}
	};

}(document));

window.onload = function() {
	taskman.formSubmit();
};