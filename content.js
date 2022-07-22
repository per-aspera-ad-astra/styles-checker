(function() {
	const stylesCheckerExtensionClass = 'SCE_popup';
	const currentCheckingElementClass = 'SCE_checking-element';
	const closeExtensionClass = 'SCE_header-btn-close';
	const moveLeftButtonClass = 'SCE_header-btn-left';
	const moveRightButtonClass = 'SCE_header-btn-right';
	let freeze = false;
	let posLeft = 'inherit';
	let posRight = '5px';

	init();

	window.addEventListener('keydown', (e) => {
		if (e.key === 'f') {
			if (freeze) {
				freeze = false;
				init();
			} else {
				freeze = true;
				freezeMoving();
			}
		}

		if (e.key === 'Escape') {
			location.reload();
		}
	});

	function init() {
		window.addEventListener('mousemove', checkMoving);
	}

	function freezeMoving() {
		window.removeEventListener('mousemove', checkMoving);
	}

	function checkMoving(e) {
		let currentElement = e.target;
		let currentTag;
		// let currentClasses;
		let styles;

		if (currentElement.closest(`.${stylesCheckerExtensionClass}`)) {
			return;
		} else {
			if (!(currentElement.classList.contains(currentCheckingElementClass))) {
				currentElement.classList.add(currentCheckingElementClass);
	
				styles = window.getComputedStyle(currentElement);
				currentTag = currentElement.tagName.toLowerCase();
				// currentClasses = currentElement.className;
				updatePopup(currentTag, styles, posLeft, posRight);
			};
	
			currentElement.addEventListener('mouseout', () => {
				currentElement.classList.remove(currentCheckingElementClass);
			});
		}
	}

	function updatePopup(tag, styles, left, right) {
		const popup = document.createElement('div');
		popup.style.left = left;
		popup.style.right = right;
		popup.classList.add(stylesCheckerExtensionClass);

		const header = `
			<header class="SCE_header">
				<div class="SCE_header-position">
					<button class="SCE_header-btn-left" title="Move to left">⬅</button>
					<button class="SCE_header-btn-right" title="Move to right">⬅</button>
				</div>
				<h3 class="SCE_header-title">Styles Checker</h3>
				<button class="SCE_header-btn-close"></button>
			</header>
			<main class="SCE_main">
				<div class="SCE_common-list">
		`;

		const footer = `
				</div>
			</main>
			<footer class="SCE_footer">
				<span>Press ' F ' to freeze or unfreeze, ' ESC ' to close.</span>
			</footer>
		`;

		function createRegularItem(val) {
			return `
				<div class="SCE_item">
					<strong class="SCE_item-prop">${val}:</strong>
					<span class="SCE_item-val">${styles.getPropertyValue(val)}</span>
				</div>
			`;
		}

		function createWrappedItem(val) {
			if (val === 'text-decoration') {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">text-decoration:</strong>
						<span class="SCE_item-val">${checkTextDecoration(styles.getPropertyValue('text-decoration'))}</span>
					</div>
				`;
			} else {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">${val}:</strong>
						<span class="SCE_item-val">${checkZeroPixels(styles.getPropertyValue(val))}</span>
					</div>
				`;
			}
		}

		function checkTextDecoration(val) {
			return val.startsWith('none') ? 'none' : val;
		}

		function checkZeroPixels(val) {
			return val === '0px' ? '0' : val;
		}

		function createBorderItem() {
			let borderVal = styles.getPropertyValue('border');

			if (borderVal) {
				borderVal =  borderVal.startsWith('0px') ? '0' : borderVal;

				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">border:</strong>
						<span class="SCE_item-val">${borderVal}</span>
					</div>
				`;
			} else {
				const borders = ['-top', '-bottom', '-left', '-right'];
				let res = '';

				borders.forEach(item => {
					if (!styles.getPropertyValue('border'+ item).startsWith('0px')) {
						res += `
							<div class="SCE_item">
								<strong class="SCE_item-prop">${'border' + item}:</strong>
								<span class="SCE_item-val">${styles.getPropertyValue('border'+ item)}</span>
							</div>
						`;
					}
				});

				return res;
			}
		}

		function createMarginAndPaddingItem(val) {
			if (styles.getPropertyValue(val).split(' ').length > 1) {
				const places = ['-top', '-bottom', '-left', '-right'];
				let res = '';

				places.forEach(place => {
					if (styles.getPropertyValue(val + place) !== '0px') {
						res += `
							<div class="SCE_item">
								<strong class="SCE_item-prop">${val + place}:</strong>
								<span class="SCE_item-val">${styles.getPropertyValue(val + place)}</span>
							</div>
						`
					}
				});

				return res;
			} else {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">${val}:</strong>
						<span class="SCE_item-val">${checkZeroPixels(styles.getPropertyValue(val))}</span>
					</div>
				`;
			}
		}

		function createDisplayItem(val) {
			let res = `
				<div class="SCE_item">
					<strong class="SCE_item-prop">display:</strong>
					<span class="SCE_item-val">${styles.getPropertyValue(val)}</span>
				</div>
			`;

			if (styles.getPropertyValue(val) === 'flex' || styles.getPropertyValue(val) === 'inline-flex') {
				const props = ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'];

				props.forEach(prop => {
					res += `
						<div class="SCE_item">
							<strong class="SCE_item-prop">${prop}:</strong>
							<span class="SCE_item-val">${styles.getPropertyValue(prop)}</span>
						</div>
					`;
				});
			}
			
			if (styles.getPropertyValue(val) === 'grid' || styles.getPropertyValue(val) === 'inline-grid') {
				const props = ['grid-template-columns', 'grid-template-rows', 'grid-row-gap', 'grid-column-gap'];

				props.forEach(prop => {
					res += `
						<div class="SCE_item">
							<strong class="SCE_item-prop">${prop}:</strong>
							<span class="SCE_item-val">${styles.getPropertyValue(prop)}</span>
						</div>
					`;
				});
			}

			return res;
		}

		function createPositionItem(val) {
			let res = `
				<div class="SCE_item">
					<strong class="SCE_item-prop">position:</strong>
					<span class="SCE_item-val">${styles.getPropertyValue(val)}</span>
				</div>
			`;

			if (styles.getPropertyValue(val) !== 'static') {
				const props = ['top', 'bottom', 'left', 'right', 'z-index'];

				props.forEach(prop => {
					res += `
						<div class="SCE_item">
							<strong class="SCE_item-prop">${prop}:</strong>
							<span class="SCE_item-val">${checkZeroPixels(styles.getPropertyValue(prop))}</span>
						</div>
					`;
				});
			}
				
			return res;
		}

		function createOverflowItem() {
			if (styles.getPropertyValue('overflow').split(' ').length > 1) {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">overflow-x:</strong>
						<span class="SCE_item-val">${styles.getPropertyValue('overflow-x')}</span>
					</div>
					<div class="SCE_item">
						<strong class="SCE_item-prop">overflow-y:</strong>
						<span class="SCE_item-val">${styles.getPropertyValue('overflow-y')}</span>
					</div>
				`;
			} else {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">overflow:</strong>
						<span class="SCE_item-val">${styles.getPropertyValue('overflow')}</span>
					</div>
				`;
			}
		}

		function createFloatItem() {
			if (styles.getPropertyValue('float') === 'none') {
				return '';
			} else {
				return `
					<div class="SCE_item">
						<strong class="SCE_item-prop">float:</strong>
						<span class="SCE_item-val">${styles.getPropertyValue('float')}</span>
					</div>
				`;
			}
		}

		popup.innerHTML = `
			${header}
				<div class="SCE_item SCE_item--tag">
					< ${tag} >
				</div>
				<div class="SCE_item SCE_item--background">
					<strong class="SCE_item-prop">background-color:</strong>
					<span class="SCE_item-val">${rgbToHex(styles.getPropertyValue('background-color'))}</span>
				</div>
				<div class="SCE_item SCE_item--color">
					<strong class="SCE_item-prop">color:</strong>
					<span class="SCE_item-val">${rgbToHex(styles.getPropertyValue('color'))}</span>
				</div>
				<div class="SCE_group">
					<h4 class="SCE_group-title">Text & Font properties</h4>
					${createRegularItem('font-family')}
					${createRegularItem('font-size')}
					${createRegularItem('line-height')}
					${createRegularItem('font-weight')}
					${createRegularItem('font-style')}
					${createRegularItem('text-align')}
					${createWrappedItem('text-decoration')}
					${createRegularItem('text-transform')}
					${createWrappedItem('letter-spacing')}
					${createWrappedItem('word-spacing')}
					${createRegularItem('white-space')}
				</div>

				<div class="SCE_group">
					<h4 class="SCE_group-title">Sizes</h4>
					${createRegularItem('height')}
					${createRegularItem('width')}
					${createMarginAndPaddingItem('padding')}
					${createMarginAndPaddingItem('margin')}
					${createRegularItem('box-sizing')}
					${createBorderItem()}
					${createWrappedItem('border-radius')}
				</div>

				<div class="SCE_group">
					<h4 class="SCE_group-title">Block properties</h4>
					${createDisplayItem('display')}
					${createPositionItem('position')}
					${createOverflowItem()}
					${createFloatItem()}
				</div>

				<div class="SCE_group">
					<h4 class="SCE_group-title">Other styles</h4>
					${createRegularItem('opacity')}
					${createRegularItem('transform')}
					${createRegularItem('transition')}
					${createRegularItem('cursor')}
				</div>
			${footer}
		`;

		document.body.insertAdjacentElement('beforeend', popup);

		if (popup.previousElementSibling.classList.contains(stylesCheckerExtensionClass)) {
			popup.previousElementSibling.remove();
		}

		closePopup(`.${closeExtensionClass}`);

		popup.addEventListener('click', (e) => {
			if (e.target.classList.contains(moveLeftButtonClass)) {
				posLeft = '5px';
				posRight = 'inherit';
				changePopupPosition(popup, '5px', 'inherit');
			}

			if (e.target.classList.contains(moveRightButtonClass)) {
				posLeft = 'inherit';
				posRight = '5px';
				changePopupPosition(popup, 'inherit', '5px');
			}
		});
	}

	function closePopup(button) {
		const closeBtn = document.querySelector(button);
		closeBtn.addEventListener('click', () => {
			location.reload();
		});
	}

	function changePopupPosition(el, left, right) {
		el.style.left = left;
		el.style.right = right;
	}

	function rgbToHex(rgb) {
		if (rgb === 'rgba(0, 0, 0, 0)') {
			return 'transparent';
		}
		
		if (rgb.indexOf('rgba') > -1) {
			return rgb;
		}

		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';

		rgb = rgb.substr(4).split(')')[0].split(sep);
	  
		let r = (+rgb[0]).toString(16),
			g = (+rgb[1]).toString(16),
			b = (+rgb[2]).toString(16);
	  
		if (r.length == 1) {
			r = '0' + r;
		}
		if (g.length == 1) {
			g = '0' + g;
		}
		if (b.length == 1) {
			b = '0' + b;
		}
	  
		return '#' + r + g + b;
	}
})();
