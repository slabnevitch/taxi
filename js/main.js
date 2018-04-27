$(document).ready(function(){	
	var $id_address = 2; //id дополнительного адреса
	$("#tel-e").mask("9 (999) 999-99-99");
	$("#tel-c").mask("9 (999) 999-99-99");
	$("#tel-or").mask("9 (999) 999-99-99");
	
	$('.js-write-modal').on('click', function(){
		var $this = $(this),
			$modal = $($this.data('modalId'));
		$('#page').addClass('form-open');
		$modal.show().removeClass('bounceOutDown').addClass('bounceInUp');
		
		if ($this.hasClass('js-fs-edit')) {
			var $username = $('#js-username').text(),
				$tel = $('#js-phone').text();
			$('#username-e').val($username);
			$('#tel-e').val($tel);
		}
		
		return false;
	});
	
	$('.js-close').on('click', function(){
		var $modal = $($(this).data('modalId'));
		$modal.removeClass('bounceInUp').addClass('bounceOutDown');
			setTimeout(function() {
				$modal.hide();
				$('#page').removeClass('form-open');
			}, 700);
		return false;
	});
	
	$(function(){
		$(document).click(function(event) {
			if ($('.fs-box').is(':visible')) {
				if ($(event.target).closest('.js-form').length) return;
				var $modal = $('.fs-box:visible');
				$modal.removeClass('bounceInUp').addClass('bounceOutDown');
				setTimeout(function() {
					$modal.hide();
					$('#page').removeClass('form-open');
				}, 700);
				event.stopPropagation();
			}
		});
	});
	
	$('#js-next').on('click', function(){
		$('#js-step-one').removeClass('bounceInUp').addClass('bounceOutDown');
		$('#js-step-two').removeClass('bounceOutDown').addClass('bounceInUp');
		
		setTimeout(function() {
			$('#js-step-one').hide();
			$('#js-step-two').show();
		}, 700);
		
		$('#steps').children('.one').removeClass('active').next().addClass('active');
		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[1] ВХОД
	=========================================================================================================================================================================*/
	$('#js-login').on('click', function(){
		var $container = $('#page'),
			$password = $('#password-l'),
			$rndval = new Date().getTime(),
			$data = {};
		
		$.post('/ajax_login.php?rndval='+ $rndval,
			{
				login: $('#login-l').val(),
				password: $password.val()
			},
			function(data){ // Обработчик ответа от сервера
				$data = $.parseJSON(data);
				if ($data.name == 'signin') {
					window.location.href = $data.redirect;
				} else {
					$password.val('').blur();
					var $field = $('#'+ $data.name +'-l'),
						$offset = $field.offset(),
						$icon = $('<i class="fa fa-exclamation-circle icon-error"></i>');
					$container.children('.icon-error').remove();		
					$icon.css({top: $offset.top + 14, left: $offset.left + $field.width()});
					$container.prepend($icon);
					$container.children('.icon-error').delay(7000).fadeOut(500);
					popupInfo($data.error, true);
				}
  			});
		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[2] Выбор дополнительной услуги
	=========================================================================================================================================================================*/
	$('#js-wrap-services').children('li').on('click', function(){
		var $this = $(this),
			$modal = $('#js-services-modal'),
			$el = $('#js-additional-services'), //дополнительные услуги
			$el_text = $el.text(),
			$price_block = $('#js-price'),
			$price = parseInt($this.data('price')), //цена услуги
			$distance_price = parseInt($price_block.text()),
			$all_price = $distance_price + $price;
		
		$modal.removeClass('bounceInUp').addClass('bounceOutDown');
		setTimeout(function() {
			$modal.hide();
			$('#page').removeClass('form-open');
		}, 700);
		
		if ($el_text == 'Выберите дополнительные услуги') {
			$el.text($this.text());
			$price_block.text($all_price +' Руб.');
		} else {
			if ($el_text.search($this.text()) == -1) {
				$el.text($el_text +', '+ $this.text());
				$price_block.text($all_price +' Руб.');
			}
		}
		
		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[3] Редактирование профиля
	=========================================================================================================================================================================*/
	$('#js-edit').on('click', function(){
		
		var $this = $(this),
			$modal = $('#js-edit-modal'),
			$username = $('#username-e').val(),
			$tel = $('#tel-e').val(),
			$rndval = new Date().getTime();
		
		if ($username == '' || $tel == '') {
			popupInfo('Заполните все поля формы', true);
			return false;
		}
		
		$.post('/ajax_edit.php?rndval='+ $rndval,
			{
				username: $username,
				tel: $tel
			},
			function(data){ // Обработчик ответа от сервера
				if (data == 'update') {	
					$modal.removeClass('bounceInUp').addClass('bounceOutDown');
					setTimeout(function() {
						$modal.hide();
						$('#page').removeClass('form-open');
					}, 700);
					
					$('#js-username').text($username);
					$('#js-phone').text($tel);
					popupInfo('Данные сохранены');
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[4] Аватар
	=========================================================================================================================================================================*/
	$('#js-file').on('click', function(){
        $('#photoupload').click();
    });
    
	if ($('#upload').length) {
		$('#upload').fileupload({
			add: function (e, data) {
				data.formData = {user_id: $('#js-file').data('userId')};
				// Automatically upload the file once it is added to the queue
				var jqXHR = data.submit();
			},
			success: function (result, textStatus, jqXHR) {
				var $result = $.parseJSON(result);
				
				switch ($result.code) {
					case "0" : 
						popupInfo('Произошла ошибка', true);
						break;
					case "3" : 
						popupInfo('Максимальный размер файла: '+ $d.maxSize +' MB', true); 
						break;
					case "2" : 
						popupInfo('Этот тип файла не поддерживается (разрешено JPG, PNG или GIF)', true);
						break;
					default :
						$('#js-avatar').attr('src', '/img/avatar/'+ $result.target);
				}
			}
		});
	}
	
	
	/*=========================================================================================================================================================================
	[5] Сортировка и фильтр по районам
	=========================================================================================================================================================================*/
	// init Isotope
	var $table = $('#js-wrap-items').isotope({
		layoutMode: 'vertical',
		getSortData: {
			price: '.price parseInt'
		},
		filter: '.item[data-page="1"]'
	});

	// bind sort button click
	$('#sorts').on('click', '.js-button', function() {
		var $this = $(this), 
			sortValue = $this.attr('data-sort-value'),
			sortDirection = $this.attr('data-sort-direction');

		/* convert it to a boolean */
		sortDirection = sortDirection == 'asc';
		/* pass it to isotope */
		$table.isotope({sortBy: sortValue, sortAscending: sortDirection});
	});
	
	// bind filter button click
	$('#js-filter').on('click', function() {
		var filterValue = $(this).attr('data-filter'),
			$item = '.item[data-filter = "'+ filterValue +'"]';
		// use filterFn if matches value
		$table.isotope({filter: $item});
	});
	
	// bind filter button click
	$('#js-navigation').on('click', '.js-page', function() {
		var $this = $(this),
			filterValue = $this.attr('data-page'),
			$sel = '.item[data-page="'+ filterValue +'"]';
		// use filterFn if matches value
		$table.isotope({ filter: $sel });
		
		$('#js-navigation').children('.js-page').removeClass('active');
    	$this.addClass('active');
	});
	
	
	/*=========================================================================================================================================================================
	[6] Обратное направление
	=========================================================================================================================================================================*/
	$('#js-reverse').on('click', function(){
		var $from = $('#js-from'),
			$from_text = $from.val(),
			$from_route = $from.data('route'),
			$to = $('#js-to'),
			$to_text = $to.val(),
			$to_route = $to.data('route');
		
		$from.val($to_text).data('route', $to_route);
		$to.val($from_text).data('route', $from_route);
		
		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[7] Добавить адрес
	=========================================================================================================================================================================*/
	$('#js-add-address').on('click', function(){
		var $el = $(this).parents('.add-address');
		
		$el.before('<input class="input__field js-dadata" id="js-to'+ $id_address +'" type="text">');
		$id_address ++;
		tipAddress();
		
		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[8] Принятие заказа
	=========================================================================================================================================================================*/
	$('#js-wrap-items').on('click', '.js-status', function(){
		
		var $id = $(this).data('value'),
			$rndval = new Date().getTime(),
			$data = {};
		
		$.post('/ajax_accept_order.php?rndval='+ $rndval,
			{
				id: $id
			},
			function(data){ // Обработчик ответа от сервера
				$data = $.parseJSON(data);
				if ($data.name == 'taken') {
					window.location.href = $data.redirect;
				} else if ($data.name == 'error') {
					popupInfo($data.error, true);
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	$('#js-delivered').on('click', function(){
		
		var $id = $(this).data('value'),
			$rndval = new Date().getTime(),
			$data = {};
		
		$.post('/ajax_delivered_order.php?rndval='+ $rndval,
			{
				id: $id
			},
			function(data){ // Обработчик ответа от сервера
				$data = $.parseJSON(data);
				if ($data.name == 'delivered') {
					window.location.href = $data.redirect;
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	$('#js-cancel').on('click', function(){
		
		var $id = $(this).data('value'),
			$rndval = new Date().getTime(),
			$data = {};
		
		$.post('/ajax_cancel_order.php?rndval='+ $rndval,
			{
				id: $id
			},
			function(data){ // Обработчик ответа от сервера
				$data = $.parseJSON(data);
				if ($data.name == 'cancel') {
					window.location.href = $data.redirect;
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[9] Yandex maps
	=========================================================================================================================================================================*/	
	var map;
	ymaps.ready(function(){
		map = new ymaps.Map("map", { center: [55.76, 37.64], zoom: 10 });
	});
	
	tipAddress();
	
	$('#page').on('keyup', '.js-dadata', function(){
		var $input = $(this);
		
		if ($input.val() == '') {
			$input.removeData('route');
		}
	});
	
	
	/*=========================================================================================================================================================================
	[10] Получить консультацию
	=========================================================================================================================================================================*/
	$('#js-consult').on('click', function(){
		
		var $modal = $('#js-consult-modal'),
			$email = $('#email-c').val(),
			$tel = $('#tel-c').val(),
			$rndval = new Date().getTime();
		
		if ($email == '' && $tel == '') {
			popupInfo('Заполните хотя бы одно поле', true);
			return false;
		}
		
		$.post('/ajax_consult.php?rndval='+ $rndval,
			{
				email: $email,
				tel: $tel
			},
			function(data){ // Обработчик ответа от сервера
				if (data == 'success') {	
					$modal.removeClass('bounceInUp').addClass('bounceOutDown');
					setTimeout(function() {
						$modal.hide();
						$('#page').removeClass('form-open');
					}, 700);
					
					popupInfo('Заявка отправлена. В ближайшее время с вами свяжется оператор');
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	
	/*=========================================================================================================================================================================
	[11] Оформление заказа
	=========================================================================================================================================================================*/
	$('#js-add-order').on('click', function(){
		
		var $from = $('#js-from').data('route'), //Откуда
			$wishes = $('#wishes-or').val(), //Пожелания к заказу
			$services = $('#js-additional-services').text(), //Дополнительные услуги
			$price = parseInt($('#js-price').text()), //Стоимость поездки
			$username = $('#username-or').val(), //Имя
			$tel = $('#tel-or').val(), //Телефон
			$rndval = new Date().getTime(),
			$to = '', //Куда
			$data = {};
		
	$('.js-dadata').each(function(index) {
		var $this = $(this);
		
		if ($to != '') {
			$to += '; ';
		}
		
		if ($this.attr('id') != 'js-from' && $this.data('route')) {
			$to += $this.data('route');
		}
		
	});
		
		
		if ($from == '') {
			popupInfo('Поле "Откуда" обязательное', true);
			return false;
		}
		if ($to == '') {
			popupInfo('Нужно ввести хотя бы один адрес куда ехать', true);
			return false;
		}
		if ($username == '') {
			popupInfo('Поле "Ваше имя" обязательное', true);
			return false;
		}
		if ($tel == '') {
			popupInfo('Поле "Ваш телефон" обязательное', true);
			return false;
		}
		
		$.post('/ajax_add_order.php?rndval='+ $rndval,
			{
				from: $from,
				to: $to,
				wishes: $wishes,
				services: $services,
				price: $price,
				username: $username,
				tel: $tel,
				soon: $('#js-soon').data('flag'), //Ближайшее время
				cash: $('#js-cash').data('flag'), //Наличные
				remainder: $('#js-remainder').data('flag') //Без сдачи
			},
			function(data){ // Обработчик ответа от сервера
				$data = $.parseJSON(data);
				if ($data.name == 'success') {
					popupInfo('Заказ добавлен');
					
					setTimeout(function() {
						window.location.href = $data.redirect;
					}, 3000);
				} else {
					popupInfo('Возникла ошибка', true);
				}
  		});

		return false; 
	});
	
	$(function(){
		if($(window).width() <= 480) {
				$('#js-cancel').text('Отказаться');
			} else {
				$('#js-cancel').text('Отказаться от заказа');
			}
	});
	
	/*=========================================================================================================================================================================
	[12] ближайшее время, наличные, без сдачи
	=========================================================================================================================================================================*/
	$('.js-icon').on('click', function(){
		var $this = $(this);
		if ($this.data('flag') == '1') {
			popupInfo('Опция отменена');
			$this.data('flag', 0);
		} else {
			popupInfo('Опция добавлена');
			$this.data('flag', 1);
		}
	});
	
}); //END $(document).ready


//автозаполнения адресов
function tipAddress() {
	$(".js-dadata").suggestions({
        token: $('#js-step-one').data('token'),
        type: "ADDRESS",
        count: 5,
		constraints: [
			{
				label: "КЕМЕРОВСКИЙ Р-Н",
				locations: {kladr_id: "4200100000000"},
				deletable: true
			},
			{
				locations: {kladr_id: "4200000900000"},
				deletable: true
			}
		],
		// в списке подсказок не показываем область и город
		restrict_value: true,
        /* Вызывается, когда пользователь выбирает одну из подсказок */
        onSelect: function(suggestion) {
            $(this).data('route', suggestion.value).focus();
			findWay();
        }
	});
}

//расстояние между точками
function findWay() {
	var $arr = [],
		$out = false; //за пределами города
		
	$('.js-dadata').each(function(index) {
		var $this = $(this),
			$route = $this.data('route');
		
		if ($this.data('route')) {
			$arr.push($route.replace('Кемеровская обл, ', ''));//###2w
			
			if($route.indexOf('Кемеровский') + 1) {
				$out = true;
			}
		}
	});
		
	if ($arr.length > 1) {
		ymaps.route($arr).then(
			function (route) {
				var distance = route.getHumanLength();
				tripCost(distance, $out);
				map.geoObjects.add(route);
			},
			function (error) {
				popupInfo('Ошибка: ' + error.message, true);
			}
		);
	}
}


//стоимость поездки, $out - за пределами города
function tripCost($distance, $out) {
	var $cost = 0, //стоимость поездки
		$min = true; //минимальный проезди
	
	if ($distance.indexOf('км') + 1) {
		$distance = parseFloat($distance);
	} else {
		$distance = parseFloat($distance) / 1000;
	}
	
	/*
	//минимальный проезд
	if ($distance > 2) {
		$distance = $distance - 2;
		$min = false; 
	}
	
	if ($out) {
		$cost = $distance * 14;
	} else {
		if ($distance >= 2 && $distance < 3) {
			$cost = $distance * 33;
		} else if ($distance >= 3 && $distance < 4) {
			$cost = $distance * 29;
		} else if ($distance >= 4 && $distance < 5) {
			$cost = $distance * 25;
		} else if ($distance >= 5 && $distance < 6) {
			$cost = $distance * 22;
		} else if ($distance >= 6 && $distance < 7) {
			$cost = $distance * 21;
		} else if ($distance >= 7 && $distance < 8) {
			$cost = $distance * 20;
		} else if ($distance >= 8 && $distance < 9) {
			$cost = $distance * 19;
		} else if ($distance >= 9 && $distance < 10) {
			$cost = $distance * 18;
		} else if ($distance >= 10 && $distance < 12) {
			$cost = $distance * 17;
		} else if ($distance >= 12 && $distance < 13) {
			$cost = $distance * 16.5;
		} else if ($distance >= 13 && $distance < 14) {
			$cost = $distance * 16;
		} else if ($distance >= 14 && $distance < 15) {
			$cost = $distance * 15.5;
		} else if ($distance >= 15 && $distance < 17) {
			$cost = $distance * 15;
		} else if ($distance >= 17 && $distance < 19) {
			$cost = $distance * 14.5;
		} else {
			$cost = $distance * 15;
		}
	}
	*/
	
	
	
	/*
	if ($min) {
		$cost = 50;
	} else {
		$cost = $cost + 50; //добавляем минимальный проезд
	}
	*/
	$cost = $distance * 15;
	
	if ($cost < 50) {
		$cost = 50;
	}
	console.log($distance);
	
	$cost = $cost.toFixed(); //округление, длина дробной части ноль
	$('#js-price').text(roundTo5($cost) +' Руб.');
}


//popup уведомлений
function popupInfo($text, $error){
	if ($('.popup-info').length) $('.popup-info').remove();
		
	var $class = 'popup-info',
		$icon = 'fa fa-check-circle',
		$popupInfo = '';
		
	if ($error) {
		$class = 'popup-info popup-error';
		$icon = 'fa fa-exclamation-circle';
	}
		
	$popupInfo = $('<div><i class="'+ $icon +'"></i><p>'+ $text +'</p></div>')
	.addClass($class);
	$('#page').prepend($popupInfo);
	$('.popup-info').delay(7000).fadeOut(500);
}

//Округление вверх и вниз до ближайшего кратного числа
function roundTo5(num) {
    return Math.round(num/5)*5;
}