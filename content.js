(function() {
	const stylesCheckerExtensionClass = 'SCE_popup';
	const currentCheckingElementClass = 'SCE_checking-element';
	const closeExtensionClass = 'SCE_header-btn-close';
	const moveLeftButtonClass = 'SCE_header-btn-left';
	const moveRightButtonClass = 'SCE_header-btn-right';
	const activeButtonClass = 'SCE_header-btn-active';
	let freeze = false;
	let posLeft = 'inherit';
	let posRight = '5px';
	let currentElement = document.body;

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
		removeCurrentClass(currentElement, currentCheckingElementClass);
		currentElement = e.target;

		let currentTag;
		let styles;

		if (currentElement.closest(`.${stylesCheckerExtensionClass}`)) {
			return;
		} else {
			if (!(currentElement.classList.contains(currentCheckingElementClass))) {
				currentElement.classList.add(currentCheckingElementClass);
	
				styles = window.getComputedStyle(currentElement);
				currentTag = currentElement.tagName.toLowerCase();
				updatePopup(currentTag, styles, posLeft, posRight);
			};
	
			currentElement.addEventListener('mouseout', () => {
				if (!freeze) {
					removeCurrentClass(currentElement, currentCheckingElementClass);
				}
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
					<button class="${moveLeftButtonClass} ${posLeft === 'inherit' ? activeButtonClass : ''}"" title="Move to left">⬅</button>
					<button class="${moveRightButtonClass} ${posRight === 'inherit' ? activeButtonClass : ''}" title="Move to right">⬅</button>
				</div>
				<h3 class="SCE_header-title">Styles Checker</h3>
				<button class="SCE_header-btn-close">✖</button>
			</header>
			<main class="SCE_main">
		`;

		const footer = `
			</main>
			<footer class="SCE_footer">
				<span>Press ' F ' to freeze or unfreeze</span>
			</footer>
		`;

		function getProp(val) {
			return styles.getPropertyValue(val);
		}

		function createRegularItem(
			val,
			extraFunction = null,
			extraClass = '',
			extraHTML = null
		){
			const populateProp = extraFunction ? extraFunction(getProp(val)) : getProp(val);
			return `
				<div class="SCE_item SCE_item--${extraClass}">
					<strong class="SCE_item-prop">${val}:</strong>
					${extraHTML || ''}
					<span class="SCE_item-val">${populateProp}</span>
				</div>
			`;
		}

		function createComplexItem(val) {
			if (val === 'text-decoration') {
				if (styles.getPropertyValue(val).startsWith('none')) {
					return '';
				} else {
					return createRegularItem(val, rgbToHexInProp);
				}
			} else if (val === 'text-transform') {
				return styles.getPropertyValue(val).startsWith('none') ? '' : createRegularItem(val);
			} else if (val === 'word-spacing') {
				return styles.getPropertyValue(val).startsWith('0') ? '' : createRegularItem(val);
			} else if (val === 'font-style' || val === 'white-space' || val === 'letter-spacing') {
				return styles.getPropertyValue(val) === 'normal' ? '' : createRegularItem(val);
			} else {
				return createRegularItem(val, checkZeroPixels);
			}
		}

		function createColorItem(val) {
			function checkTransparent() {
				return rgbToHex(styles.getPropertyValue(val)) === 'transparent' ? '' :
					`<span class="SCE_item-color" style="background: ${styles.getPropertyValue(val)}"></span>`;
			}

			return createRegularItem(val, rgbToHex, 'color', checkTransparent());
		}

		function createBorderItem() {
			let borderVal = styles.getPropertyValue('border');

			if (borderVal) {
				return borderVal.startsWith('0px') ? '' : createRegularItem('border', rgbToHexInProp);
			} else {
				const borders = ['-top', '-bottom', '-left', '-right'];
				let res = '';

				borders.forEach(item => {
					if (!styles.getPropertyValue('border' + item).startsWith('0px')) {
						res += createRegularItem('border' + item, rgbToHexInProp);
					}
				});

				return res;
			}
		}

		function createBorderRadiusItem() {
			let borderRadiusVal = styles.getPropertyValue('border-radius');

			if (borderRadiusVal) {
				return borderRadiusVal.startsWith('0px') ? '' : createRegularItem('border-radius');
			} else {
				const borders = ['-top-left-radius', '-top-right-radius', '-bottom-left-radius', '-bottom-right-radius'];
				let res = '';

				borders.forEach(item => {
					if (!styles.getPropertyValue('border' + item).startsWith('0px')) {
						res += createRegularItem('border' + item);
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
						res += createRegularItem(val + place);
					}
				});

				return res;
			} else {
				return createRegularItem(val, checkZeroPixels);
			}
		}

		function createDisplayItem() {
			const val = 'display';
			let res = createRegularItem(val);

			if (getProp(val) === 'flex' || getProp(val) === 'inline-flex') {
				const props = ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'];

				props.forEach(prop => {
					res += createRegularItem(prop);
				});
			}
			
			if (getProp(val) === 'grid' || getProp(val) === 'inline-grid') {
				const props = ['grid-template-columns', 'grid-template-rows', 'grid-row-gap', 'grid-column-gap'];

				props.forEach(prop => {
					res += createRegularItem(prop);
				});
			}

			return res;
		}

		function createPositionItem() {
			const val = 'position';

			let res = createRegularItem(val);

			if (getProp(val) !== 'static') {
				const props = ['top', 'bottom', 'left', 'right', 'z-index'];

				props.forEach(prop => {
					res += createRegularItem(prop, checkZeroPixels);
				});
			}
				
			return res;
		}

		function createOverflowItem() {
			if (getProp('overflow').split(' ').length > 1) {
				return `
					${createRegularItem('overflow-x')}
					${createRegularItem('overflow-y')}
				`;
			} else {
				return createRegularItem('overflow');
			}
		}

		function createFloatItem() {
			if (getProp('float') === 'none') {
				return '';
			} else {
				return createRegularItem('float');
			}
		}

		popup.innerHTML = `
			${header}
				<div class="SCE_item SCE_item--tag">
					< ${tag} >
				</div>
				<div class="SCE_group">
					${createColorItem('background-color')}
					${createColorItem('color')}
				</div>
				<div class="SCE_group">
					<h4 class="SCE_group-title">Text & Font properties</h4>
					${createRegularItem('font-family')}
					${createRegularItem('font-size')}
					${createRegularItem('line-height')}
					${createRegularItem('font-weight')}
					${createComplexItem('font-style')}
					${createRegularItem('text-align')}
					${createComplexItem('text-decoration')}
					${createComplexItem('text-transform')}
					${createComplexItem('letter-spacing')}
					${createComplexItem('word-spacing')}
					${createComplexItem('white-space')}
				</div>
				<div class="SCE_group">
					<h4 class="SCE_group-title">Sizes</h4>
					${createRegularItem('height')}
					${createRegularItem('width')}
					${createMarginAndPaddingItem('padding')}
					${createMarginAndPaddingItem('margin')}
					${createRegularItem('box-sizing')}
					${createBorderItem()}
					${createBorderRadiusItem()}
				</div>
				<div class="SCE_group">
					<h4 class="SCE_group-title">Block properties</h4>
					${createDisplayItem()}
					${createPositionItem()}
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
			const btnLeft = document.querySelector(`.${moveLeftButtonClass}`);
			const btnRight = document.querySelector(`.${moveRightButtonClass}`);

			if (e.target.classList.contains(moveLeftButtonClass)) {
				posLeft = '5px';
				posRight = 'inherit';
				changePopupPosition(popup, '5px', 'inherit');
				btnLeft.classList.remove(activeButtonClass);
				btnRight.classList.add(activeButtonClass);
			}

			if (e.target.classList.contains(moveRightButtonClass)) {
				posLeft = 'inherit';
				posRight = '5px';
				changePopupPosition(popup, 'inherit', '5px');
				btnRight.classList.remove(activeButtonClass);
				btnLeft.classList.add(activeButtonClass);
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

	function removeCurrentClass(el, className) {
		el.classList.remove(className);
	}

	function checkZeroPixels(val) {
		return val === '0px' ? '0' : val;
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

	function rgbToHexInProp(val) {
		return val.slice(0, val.indexOf('rgb')) + rgbToHex(val.slice(val.indexOf('rgb')));	
	}
})();
