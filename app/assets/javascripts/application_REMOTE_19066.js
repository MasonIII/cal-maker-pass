// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .
$(document).ready( function () {
	$('.plus-svg').click( function () {
		$('#modal').fadeIn(500);
	});
	$('#new-item-cancel').click( function () {
		$('#modal').fadeOut(500);
	});
	$('#modal-overlay').click( function () {
		$('#modal').fadeOut(500);
	});
	$('.cart-svg').click( function () {
		manageCart();
	});
	$('.comment-arrow').click( function () {
		var commentArrow = $(this);
		var comments = $(".cart-textarea");
		if ( commentArrow.hasClass('comment-arrow-down') ) {
			commentArrow.removeClass('comment-arrow-down');
			comments.fadeOut(100);	
			setTimeout( function () {
				comments.css("height","0px");
			}, 100);
		} else {
			commentArrow.addClass('comment-arrow-down');
			comments.css("height","33px");
			setTimeout( function () {
				comments.fadeIn(100);
			}, 100);
		}
	});
	// $('#new-item-container').click( function (e) {
	// 	e.stopPropagation();
	// })
});

function manageCart() {
	var itemsPanel = $('#items-panel');
	var cartPanel = $('#cart-panel');
	var checkoutFooter = $('#checkout-footer');
	var cartItems = $('#cart-items');
	var addColumn = $('.add-column');
	if ( itemsPanel.hasClass('items-panel-expanded')) {
		itemsPanel.removeClass('items-panel-expanded');
		cartPanel.removeClass('cart-panel-hidden');
		checkoutFooter.fadeIn(300);
		cartItems.fadeIn(300);
		addColumn.css('width', 'auto');
		setTimeout( function () {
			addColumn.fadeIn(300);
		}, 100);
	} else {
		itemsPanel.addClass('items-panel-expanded');
		cartPanel.addClass('cart-panel-hidden');
		checkoutFooter.fadeOut(300);
		cartItems.fadeOut(300);
		addColumn.css('width', '0');
		setTimeout( function () {
			addColumn.fadeOut(300);
		}, 100);
	}
}
