/*!
JS for Formloom 4
Copyright (c) 2018 Yabdab Inc.
https://yabdab.com/plugins/formloom/
Published: 2023-05-26 14:28:05 +0000
Formloom v. 4.0.16 (545)
*/

( function() { // create local scope

// don't let this fire twice
if (window.formloomisloaded) return;
  window.formloomisloaded = 1;

var form_selector = '#yd-form-page12';
var $btn = $( form_selector + ' button[type=submit]');
var preview_mode = false;
var no_theme = true;
var submitBtnText = 'Submit';
var loginBtnText = 'Login';
var use_recaptcha = true; // bool
var recaptcha_site_key = '6Ld-mcwZAAAAAIc3ILUTms3e6jVOWY6ZFsIO5CxU';
var signaturePad;
var $sections;
var yd_step_loaded = 0;
var success_title = '';
var error_title = '';
var close_button = '';
var success_message = 'Your form was sent successfully.';
var error_message = 'Oops! An error occurred.';
var honeypot = true;

var alertTemplate = '<div class="grid-container">'
+ '<div class="control-group yd-input incase yd-col-12">'
+ '<div class="yd-alert yd-alert-{type}" role="alert">'
+ '<span class="yd-alert-title"">{title}</span>'
+ '{content}'
+ '</div></div></div>'

var stackdata = {};
var stacksPage;

// setup seamless if needed
if (no_theme) {

stackdata['close_button'] = close_button;
stackdata['error_title'] = error_title;
stackdata['success_title'] = success_title;
stackdata['error_message'] = error_message;
stackdata['success_message'] = success_message;
stackdata['overlay_opacity'] = '.50';
stackdata['overlay_color'] = '#000000';
stackdata['modal_text_color'] = '#000000';
stackdata['modal_bkgrd_color'] = '#FFFFFF';
stackdata['modal_border_color'] = '#8C8C8C';
stackdata['error_color'] = '#DB898C';
stackdata['success_color'] = '#A5D393';

stacksPage = window.seamless.connect({container:'html', onUpdate: function(){ console.log('formloom updated'); } });

}


function formloom($) {

$(document).ready(function() {

$sections = $('.yd-step');

// go back to first step if stepped form
if($(".form-navigation").length > 0) {
navigateTo(0); // if steps are used
}

// prevent enter key submits
$(form_selector).on('keydown', function(e) {
//console.debug(e.target);
if (e.keyCode === 13 && e.target.tagName.toLowerCase() !== 'textarea' && e.target.className.toLowerCase() !== 'trumbowyg-editor' ){
e.preventDefault();
}
});


/* @tooltips
------------------------------------------- */
tippy('.yd-trigger');

/* @range-slider
------------------------------------------- */

var valueBubble = '<output class="rangeslider__value-bubble" />';

function updateRangeBubble(pos, value, context) {
pos = pos || context.position;
value = value || context.value;
var $valueBubble = $('.rangeslider__value-bubble', context.$range);
var tempPosition = pos + context.grabPos;
var position = (tempPosition <= context.handleDimension) ? context.handleDimension : (tempPosition >= context.maxHandlePos) ? context.maxHandlePos : tempPosition;

if ($valueBubble.length) {
$valueBubble[0].style.left = Math.ceil(position) + 'px';
$valueBubble[0].innerHTML = value ;
}
}

$('input[type="range"]').rangeslider({
polyfill : false,
onInit : function() {
//this.output = $( '<div class="range-output" />' ).insertAfter( this.$range ).html( this.$element.val() );
this.$range.append($(valueBubble));
updateRangeBubble(null, null, this);
},
onSlide : function( pos, value ) {
//this.output.html( value );
updateRangeBubble(pos, value, this);
}
});


/* @checkbox-radios
------------------------------------------- */
$('div[class^="yd-"] .radio_checkbox')
.find('input[type=checkbox], input[type=radio]').not('.fs-checkbox-element').checkbox();


/* @close notification(s)
------------------------------------------- */
$(form_selector).on("click", "a.close-btn", function(e) {
e.preventDefault();
$(this).closest('.notification').remove();
});

/* @password reveal
------------------------------------------- */
$('.toggle-password').on("click", function() {
// get the attribute value
var input = $(this).next('input');
var type = input.prop("type");
// now test it's value
if( type === 'password' ){
input.prop("type", "text");
$(this).html('<i class="fas fa-eye-slash"></i>');
}else{
input.prop("type", "password");
$(this).html('<i class="fas fa-eye"></i>');
}
});

/* @color items
------------------------------------------- */
$('.yd-color').each(function(i, elem) {

var default_color = $(this).val();
$(this)
.closest('.control-group')
.find('.color-well')
.css('background', default_color);

var hueb = new Huebee(elem, {
setBGColor: false, // or can specify a class to change color
notation: 'hex',
setColor: default_color,
staticOpen: false // display open and stay open
});

hueb.on('change', function(color, hue, sat, lum) {
$(event.target)
.closest('.control-group')
.find('.color-well')
.css('background', color);
hueb.close();
});

});


/* @wysiwyg
------------------------------------------- */
$.trumbowyg.svgPath = false;
$('.yd-wysiwyg').trumbowyg({
hideButtonTexts: true,
btns: [
['viewHTML'],
['undo', 'redo'], // Only supported in Blink browsers
['strong', 'em', 'del'],
['foreColor', 'backColor'],
//['emoji'],
['orderedList'],
['horizontalRule'],
['fullscreen']
]
});

/* @file items
------------------------------------------- */
$(".yd-file > input").on('change', function(e){
$valueDom = $(this).closest('.yd-file').find('.selected-file');
var filename = $('.yd-file').data('label');
if(e.target){
var fullPath = e.target.value;
filename = fullPath.replace(/^.*[\\\/]/, '');
$valueDom.text(filename);
}
});


/* @ signature functions
------------------------------------------- */

var wrapper = document.getElementById('yd-signature');

if(wrapper){

var clearButton = wrapper.querySelector('[data-action=clear]');
var undoButton = wrapper.querySelector('[data-action=undo]');
var canvas = wrapper.querySelector('canvas');
signaturePad = new SignaturePad(canvas, {
backgroundColor: 'rgb(255, 255, 255)'
});

function resizeCanvas() {
var ratio = Math.max(window.devicePixelRatio || 1, 1);
canvas.width = canvas.offsetWidth * ratio;
canvas.height = canvas.offsetHeight * ratio;
canvas.getContext('2d').scale(ratio, ratio);
signaturePad.clear();
}

//window.onresize = resizeCanvas;

resizeCanvas(); // only onload, never on resize - MY

clearButton.addEventListener('click', function(event) {
signaturePad.clear();
});
undoButton.addEventListener('click', function(event) {
var data = signaturePad.toData();
if (data) {
data.pop(); // remove the last dot or line
signaturePad.fromData(data);
}
});

}



/* @ bind to the form's submit event
------------------------------------------- */
$(form_selector).submit(function(e) {

if( honeypot && $('input#rellikmaps').length > 0 )
{
  if ($('input#rellikmaps').val().length > 0) {
    return false;
  }
}

$('#yd-form-results').html("");

$btn.find('span').html('<i class="far fa-cog fa-spin"><i>');
$btn.prop('disabled', true).addClass('disabled');

// send sig dataurl
if($("#yd-signature").length > 0) {
// sends image data url
var form_item = $('#yd-signature').data('item');
// console.debug('save sig data to #' + form_item);
var sigdata = signaturePad.toDataURL();
// console.debug(sigdata);
$('input[name=signature]' ).val(sigdata);
}

if(use_recaptcha)
{
grecaptcha.ready(function() {
grecaptcha.execute( recaptcha_site_key , { action: 'create_comment' }).then(function(token) {
// add token to form
$('<input />').attr('type', 'hidden')
.attr('name', "recaptcha_token")
.attr('value', token )
.appendTo(form_selector);
$('<input />').attr('type', 'hidden')
.attr('name', "action")
.attr('value', "create_comment" )
.appendTo(form_selector);
submitForm();
});
});

}else{

submitForm();

}

// !!! Important !!!
// always return false to prevent standard browser submit and page navigation
e.preventDefault();
return false;

});

// focus on first input when ready
// bring this back as optional later
// $(form_selector +' input:text').first().focus();

$(form_selector + ' .refresh-captcha').click(function(e){
console.debug('refresh captcha');
e.preventDefault();
reloadCaptcha(form_selector);
});


/* @ remove alerts
------------------------------------------- */
$(document).on('click','.yd-alert .yd-close', function(e){
$(this).closest('.yd-alert').remove();
e.preventDefault();
});

/* @ close modal
------------------------------------------- */
$('.yd-modal-close').on('click', function(e){
e.stopPropagation();
$('.yd-modal').removeClass('yd-modal-show').removeClass('error').removeClass('success');
})

/* @ step form navigation
------------------------------------------- */
$('.form-navigation .previous').click(function() {
navigateTo(curIndex() - 1);
});

$('.form-navigation .next').click(function() {
$(form_selector).parsley({ excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], [disabled], :hidden' }).whenValidate({
group: 'block-' + curIndex()
}).done(function() {
navigateTo(curIndex() + 1);
});
});

$sections.each(function(index, section) {
$(section).find(':input').attr('data-parsley-group', 'block-' + index);
});


/* @ plugin generated
------------------------------------------- */

// validation 
$('#yd-form-page12').parsley({ excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], [disabled], :hidden' });




/* @ custom code
------------------------------------------- */




}); // ready?


/* @reload captcha
------------------------------------------- */
function reloadCaptcha(selector){
var url = $(selector + " .captcha-img").attr("src");
var src = url.split('?r=');
$(selector + " .captcha-img").attr("src", src[0] + "?r=" + Math.random());
}


/* @step navigation
------------------------------------------- */
function navigateTo(index) {
console.log("go to index =" + index);
$('li.step').removeClass('active');$('li.step.step-' + index ).addClass('active');
$sections.removeClass('current').eq(index).addClass('current');
//if(yd_step_loaded) {
//$('body, html').animate({scrollTop:$(form_selector).offset().top}, 'slow');
//}
$('.form-navigation .previous').toggle(index > 0);
var atTheEnd = index >= $sections.length - 1;
if(index === 0){
$('.form-navigation div.yd-col-4:nth-of-type(1)').addClass('mobile-hide');
}else{
$('.form-navigation div.yd-col-4:nth-of-type(1)').removeClass('mobile-hide')
}
$('.form-navigation .next').toggle(!atTheEnd);
$('.form-navigation [type=submit]').toggle(atTheEnd);
yd_step_loaded = 1;
}
function curIndex() {
return $sections.index($sections.filter('.current'));
}



/* @ in iframe?
------------------------------------------- */
function inIframe () {
try {
return window.self !== window.top;
} catch (e) {
return true;
}
}



/* @ submit form
------------------------------------------- */
function submitForm()
{

var timeout = 15000;

if(preview_mode)
{


$btn.find('span').html('<i class="far fa-cog fa-spin"><i>');
$btn.prop('disabled', true).addClass('disabled');


// show somehting in preview mode
$btn.find('span').html('<i class="far fa-check-circle"></i>');

$(form_selector).resetForm();

// new, no-modal approach
var alert = alertTemplate.replace('{title}', success_title )
.replace('{type}', 'success')
.replace('{content}', success_message );
$('#yd-form-results').html(alert);

// go back to first step
if($(".form-navigation").length > 0) {
navigateTo(0); // if steps are used
}
$btn.prop('disabled', false).removeClass('disabled');

// put back submit icon
setTimeout(function() {
$btn.find('span').html('<i class="far fa-paper-plane"></i>');
}, 1000);

$('#yd-form-results').delay(10000).fadeOut('fast', function() {
$(this).html("").show();
});

}else{

$(form_selector).ajaxSubmit({
success:       onSuccess,
error: onError,
type:      'post',
dataType:  'json',
timeout:   timeout,
async: true,
headers: {
"cache-control": "no-cache"
}
});

}

}

/* @modal
------------------------------------------- */
function openModal( rs, title, msg )
{
var overlay = $( '.yd-overlay' ),
modal = $( '.yd-modal' ),
modal_close = $( '.yd-modal-close' );

modal.find('.yd-content h3').html(title);
modal.find('.yd-content p.msg').html(msg);
modal.addClass(rs).addClass('yd-modal-show');
}




/* @ajaxsubmit callbacks
------------------------------------------- */
function onBeforeSubmit(formData, jqForm, options)
{

if($("#yd-signature").length > 0) {

// sends image data url
var form_item = $('#yd-signature').data('item');
var sigdata = signaturePad.toDataURL();

var blob = dataURLToBlob(sigdata);
//console.debug(blob);
var ts = Date.now();
var fileOfBlob = new File([blob], 'signature-' + ts + '.png');
formData.push( { name: "signature", value: fileOfBlob });

}

}
function onError(xhr, status, error)
{

var alert = alertTemplate.replace('{title}', error_title )
.replace('{type}', 'error')
.replace('{content}', error_message + '<br>' + error );

// new, no-modal approach
$('#yd-form-results').html( alert );

$btn.find('span').html('<i class="far fa-times-circle"></i>');
$btn.prop('disabled', false).removeClass('disabled');

// put back submit icon
setTimeout(function() {
$btn.find('span').html('<i class="far fa-paper-plane"></i>');
}, 1000);

$('#yd-form-results').delay(5000).fadeOut('fast', function() {
$(this).html("").show();
});


}

function onSuccess(rs)
{

$('.field').removeClass("state-error, state-success");
//$(window).trigger('send-height');

if(rs.result == 'fail' || rs.result == 'loginfail')
{


if(rs.redirect && rs.result != 'loginfail')
{
// redirect to error.page
// adding top make this work in the remote stack
window.top.location = rs.redirect_url;

}else{


var btnText = (rs.result == 'loginfail') ? loginBtnText : submitBtnText;
$btn.find('span').html('<i class="far fa-times-circle"></i>');
$btn.prop('disabled', false).removeClass('disabled');


var alert = alertTemplate.replace('{title}', error_title )
.replace('{type}', 'error')
.replace('{content}', error_message + '<br>' + rs.msg );

// new, no-modal approach
$('#yd-form-results').html( alert );


// put back submit icon
setTimeout(function() {
$btn.find('span').html('<i class="far fa-paper-plane"></i>');
}, 1000);

$('#yd-form-results').delay(5000).fadeOut('fast', function() {
$(this).html("").show();
});

}




}else if(rs.result == 'loginsuccess')
{
// reload page
location.reload(true);

}else{

// destroy persisted data
$( 'input' ).garlic( 'destroy' );

if(rs.redirect)
{
// redirect to success.page
// adding top make this work in the remote stack
window.top.location = rs.redirect_url;

}else{


$btn.find('span').html('<i class="far fa-check-circle"></i>');

$(form_selector).resetForm();

if($(".captcha-img").length > 0) {
reloadCaptcha(form_selector);
}

if($("#yd-signature").length > 0) {
signaturePad.clear();
}

$('.selected-file').html('');

// new, no-modal approach
var alert = alertTemplate.replace('{title}', success_title )
.replace('{type}', 'success')
.replace('{content}', success_message );

// new, no-modal approach
$('#yd-form-results').html( alert );

// go back to first step
if($(".form-navigation").length > 0) {
navigateTo(0); // if steps are used
}


}
}

var btnText = (rs.result == 'loginfail') ? loginBtnText : submitBtnText;
$btn.find('span').html('<i class="far fa-times-circle"></i>');
$btn.prop('disabled', false).removeClass('disabled');

// put back submit icon
setTimeout(function() {
$btn.find('span').html('<i class="far fa-paper-plane"></i>');
}, 1000);


$('#yd-form-results').delay(5000).fadeOut('fast', function() {
$(this).html("").show();
});



}

function dataURLToBlob(dataURL) {
var parts = dataURL.split(';base64,');
var contentType = parts[0].split(':')[1];
var raw = window.atob(parts[1]);
var rawLength = raw.length;
var uInt8Array = new Uint8Array(rawLength);
for (var i = 0; i < rawLength; ++i) {
uInt8Array[i] = raw.charCodeAt(i);
}
return new Blob([uInt8Array], { type: contentType });
}


} // formloom fn


// lets go
jQuery.noConflict();
formloom(jQuery);



})(); // closure end

