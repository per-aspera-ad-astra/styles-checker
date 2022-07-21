// var alert = document.querySelector('.alert span');

// window.addEventListener('mousemove', function(e) {
// 	this.alert.textContent = e.target;
// });

// (function() {
// 	const spendAmount = document.getElementById('spendAmount');
// 	const total = document.getElementById('total');

// 	spendAmount.addEventListener('click', function() {
// 		chrome.storage.sync.get('total', function(budget) {
// 			var newTotal = 0;
// 			if(budget.total) {
// 				newTotal += parseInt(budget.total);
// 			}

// 			var amount = document.getElementById('amount').value;
// 			if(amount) {
// 				newTotal += parseInt(amount);
// 			}

// 			chrome.storage.sync.set({'total': newTotal});

// 			total.textContent = newTotal;
// 			amount.value = '';
// 		});
// 	})
// })();