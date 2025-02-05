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
//= require jquery.turbolinks
//= require jquery_ujs
//= require_tree .
//= require twitter/typeahead
//= require turbolinks

var items;

items = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
      url: '/query?q=%QUERY'
  }
});

items.initialize();
$('.cart-item').bind('input propertychange', function(){
    alert($(this).val());
});

$(document).ready( function () {

    updateCart(null);
    history.navigationMode = 'compatible';

    $('#new-item-button').click( function () {
        $.ajax({
            url: '/items/create_item',
            method: 'POST',
            dataType: 'script',
            success: function () {
                document.querySelector('#new-item-cancel').addEventListener('click', function() {
                    $('#modal').fadeOut(200);
                });
                document.querySelector('#modal-overlay').addEventListener('click', function() {
                    $('#modal').fadeOut(200);
                });
                document.querySelector('#new-item-add').addEventListener('click', function() {
                    var name = document.getElementById('item_name').value;
                    var price = document.getElementById('item_price').value;
                    var quantity = document.getElementById('item_quantity').value;
                    var status = document.getElementById('item_status').value;
                    var kind = document.getElementById('item_kind').value;
                    var item_dict = {'name': name, 'price': price, 'quantity': quantity, 'status':status, 'kind':kind};
                    $.ajax({
                        url: '/items',
                        method: 'POST',
                        data: {
                            item: item_dict
                        }
                    });
                });
            }
        });
    });

    $('#inventory-wrapper').on('click', '.sorter', function () {
        var sort_by = $(this).prop('id');
        $.ajax({
            url: '/items/sort',
            data: { 'sort_by' : sort_by },
            method: 'POST',
            dataType: 'script'
        }).done( function () {
            var sort_type = $('#inventory-table').attr('data-sort-type');
            var id = '#' + sort_by;
            var svg = id + ' svg';
            var span = id + ' span';
            $(id).addClass('hilite');
            if (sort_type === 'ascending') {
                $(span).addClass('sort-align');
                $(svg).attr('class', 'sort-show-down');
            } else if (sort_type === 'descending') {
                $(span).addClass('sort-align');
                $(svg).attr('class', 'sort-show-up');
            }
            if ($('#items-panel').hasClass('items-panel-expanded')) {
                $('.add-column').hide();
            } else {
                $('.add-column').show();
            }            
        });
    });

    $('#transactions-table-wrapper').on('click', '.sorter', function () {
        var sort_trans_by = $(this).prop('id');
        $.ajax({
            url: '/transactions/sort',
            data: { 'sort_trans_by' : sort_trans_by },
            method: 'POST',
            dataType: 'script'
        }).done( function () {
            var sort_trans_type = $('#transaction-table').attr('data-sort-trans-type');
            var id = '#' + sort_trans_by;
            var svg = id + ' svg';
            var span = id + ' span';
            $(id).addClass('hilite');
            if (sort_trans_type == 'ascending') {
                $(span).addClass('sort-align')
                $(svg).attr('class', 'sort-show-down');
            } else if (sort_trans_type == 'descending') {
                $(span).addClass('sort-align')
                $(svg).attr('class', 'sort-show-up');
            }        
        });
    });

    $('#phrase.typeahead').typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        }, {
          name: 'items',
          displayKey: 'name',
          source: items.ttAdapter()
        });

    $('.comment-arrow').click( function () {
        manageCommentArrow();
    });

    $('#checkout-button').click( function() {
        document.getElementById('checkout-button').setAttribute('href', "/");
        var user = document.getElementById('transaction_user').value;
        if (user === null || user === '') {
            showAlert("Must enter a SID");
        }
        else {
            var cart_items = document.getElementById('cart-items').getElementsByClassName('cart-item');
            var bought_items = [];
            for (var i = 0; i < cart_items.length; i++) {
                var item = [];
                var cart_item = cart_items[i];
                var quantity = cart_item.getElementsByClassName('cart-item-quantity')[0].value;
                var item_name = cart_item.getElementsByClassName('cart-item-name')[0].innerHTML;
                item.push(item_name);
                item.push(quantity);
                bought_items.push(item);
            }
            if (bought_items.length > 0) {
                var purpose = document.getElementById('transaction_purpose').value;
                $.ajax({
                    url: '/transactions/checkout',
                method: 'post',
                data: {
                  items: bought_items,
                  buyer: user,
                  purpose: purpose,
                },
                success: function () {
                    resetCart();
                }
              });
            }
            else {
                showAlert("No items to checkout");
            }
        }
    });

    $('.transaction-arrow').click( function () {
        var transactionArrow = $(this);
        var parentRow = this.parentElement.parentElement;
        var row_index = parentRow.rowIndex;
        var additional = 1;
        var nextRow = parentRow.parentNode.rows[row_index];
        
        if ( transactionArrow.hasClass('transaction-arrow-down') ) {
            transactionArrow.removeClass('transaction-arrow-down');
            while (nextRow.className.indexOf("line_item_row") > -1) {
                nextRow.style.display = "none";
                nextRow.className = "line_item_row";
                nextRow = parentRow.parentNode.rows[row_index+additional];
                additional += 1;
            }
        } else {
            transactionArrow.addClass('transaction-arrow-down');
            while (nextRow.className.indexOf("line_item_row") > -1) {
                nextRow.style.display = "";
                nextRow.className = nextRow.className+" line_item_expanded";
                nextRow = parentRow.parentNode.rows[row_index + additional];
                additional += 1;
            }
        }
    });

    $('#search-bar-container').keypress(function(e) {
        if(e.which == 13) {
            search();
        }
    });

    $('#pagination-wrapper').on('ajax:success', function(event, xhr, status, error) {
        search();
    });

});

function manageCart() {
    if ($('#items-panel').hasClass('items-panel-expanded')) {
        expandCart();
    } else {
        hideCart();
    }
}

function hideCart() {
    $('#items-panel').addClass('items-panel-expanded');
    $('#cart-panel').addClass('cart-panel-hidden');
    $('#checkout-footer').fadeOut(300);
    $('#cart-items').fadeOut(300);
    if ($('.comment-arrow').hasClass('comment-arrow-down')) {
        manageCommentArrow();
    }
    $(".add-column").hide();
}

function expandCart() {
    $('#items-panel').removeClass('items-panel-expanded');
    $('#cart-panel').removeClass('cart-panel-hidden');
    $('#checkout-footer').fadeIn(300);
    $('#cart-items').fadeIn(300);
    //$('.add-column').css('width', 'auto');
    setTimeout( function () {
        $('.add-column').fadeIn(300);
    }, 100);
}

function updateCart( id ) {
    $.ajax({
        url: '/items/add_item',
        data: { 'id' : id },
        method: 'POST',
        dataType: 'script'
    });
}

function deleteCartItem( id ) {
    $.ajax({
        url: '/items/delete_cart_item',
        data: { 'id' : id },
        method: 'POST',
        dataType: 'script'
    });
}

function showItem( id ) {
    $.ajax({
        url: '/items/show_item',
        data: { 'id' : id },
        method: 'POST',
        dataType: 'script',
        success: function() {
            var item_id = id;
            document.querySelector('#modal-overlay').addEventListener('click', function() {
                $('#modal').fadeOut(200);
            });
            document.querySelector('#show-item-back').addEventListener('click', function() {
                $('#modal').fadeOut(200);
            });
            document.querySelector('#modal-overlay').addEventListener('click', function() {
                $('#modal').fadeOut(200);
            });
            document.querySelector('#show-item-delete').addEventListener('click', function() {
                $.ajax({
                    url: '/items/' + item_id+'/delete',
                    method: 'POST'
                });
            });
            document.querySelector('#show-item-update').addEventListener('click', function() {
                    var name = document.getElementById('item_name').value;
                    var price = document.getElementById('item_price').value;
                    var quantity = document.getElementById('item_quantity').value;
                    var status = document.getElementById('item_status').value;
                    var kind = document.getElementById('item_kind').value;
                    var item_dict = {'name': name, 'price': price, 'quantity': quantity, 'status':status, 'kind':kind};
                    $.ajax({
                        url: '/items/'+item_id+'/update',
                        method: 'POST',
                        data: {
                            item: item_dict
                        }
                    });
            });
        }
    });
}

function editUser(id) {
    setupModal('user', id, 'edit', ['first_name', 'last_name', 'sid', 'email', 'privilege'], 'GET');
}

function setupModal(controller, id, method, form_attributes, ajax_method) {
    $.ajax({
        url: '/'+controller+'s/'+id+'/'+method,
        data: { 'id' : id },
        method: ajax_method,
        dataType: 'script',
        success: function() {
            var obj_id = id;
            document.querySelector('#'+method+'-'+controller+'-back').addEventListener('click', function(event) {
                $('#modal').fadeOut(500);
            });
            document.querySelector('#modal-overlay').addEventListener('click', function(event) {
                $('#modal').fadeOut(500);
            });
            if (document.querySelector('#'+method+'-'+controller+'-delete') !== null) {
                document.querySelector('#'+method+'-'+controller+'-delete').addEventListener('click', function(event) {
                    $.ajax({
                        url: '/'+controller+'s/'+obj_id,
                        method: 'DELETE'
                    }).success(function () {
                        location.reload();
                    });
                });
            }
            document.querySelector('#'+method+'-'+controller+'-update').addEventListener('click', function(event) {
                obj_dict = {}
                for (var i=0; i<form_attributes.length; i++) {
                    key = form_attributes[i];
                    obj_dict[key] = $('#'+controller+'_'+key).val();
                }
                $.ajax({
                    url: '/'+controller+'s/'+obj_id,
                    method: 'PUT',
                    data: obj_dict
                }).success(function () {
                    location.reload();
                });
            });
        }
    });
}

function search () {
    $.ajax({
        url: '/items/find',
        data: { 'phrase' : $("#phrase").val() },
        method: 'POST',
        dataType: 'script'
    }).done( function () {
        var sort_by = $('#inventory-table').attr('data-sort-by');
        var sort_type = $('#inventory-table').attr('data-sort-type');
        var id = '#' + sort_by;
        var svg = id + ' svg';
        var span = id + ' span';
        $(id).addClass('hilite');
        if (sort_type === 'ascending') {
            $(span).addClass('sort-align');
            $(svg).attr('class', 'sort-show-down');
        } else if (sort_type === 'descending') {
            $(span).addClass('sort-align');
            $(svg).attr('class', 'sort-show-up');
        }
        if ($('#items-panel').hasClass('items-panel-expanded')) {
            $('.add-column').hide();
        } else {
            $('.add-column').show();
        }
        $("#phrase").val("");
        $(".tt-dropdown-menu").hide();
    });
}

function makeButtonActive( buttonId ) {
    $('#'+buttonId).removeClass('button-red');
    $('#'+buttonId).addClass('button-blue');
}

function showAlert( alert ) {
    console.log('show alert');
    window.alert(alert);
}

function resetCart() {
    manageCommentArrow();
    hideCart();
    $('#transaction_user').val('');
    $('#transaction_purpose').val('');
    $('#cart-items').html('');
}

function manageCommentArrow() {
    var commentArrow = $('.comment-arrow');
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
}
