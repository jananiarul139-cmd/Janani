/*! RESOURCE: /scripts/stream_citation_animation.js */
(function() {
	'use strict';
	var ANIMATION_CONFIG = {
		DURATION: 1800,
		STAY_VISIBLE: 300,
		FADE_DURATION: 800,
		FOCUS_BUFFER: 300,
		CLEANUP_BUFFER: 100,
		PADDING: 4,
		TAB_SWITCH_BUFFER: 200,
		SCROLL_BUFFER: 600,
		STROKE_OFFSET: 1,
		BORDER_RADIUS: 4
	};
	function createSVGRect(width, height, perimeter) {
var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		var offset = ANIMATION_CONFIG.STROKE_OFFSET;
		rect.setAttribute('x', offset);
		rect.setAttribute('y', offset + ANIMATION_CONFIG.PADDING);
		rect.setAttribute('width', width - offset * 2);
		rect.setAttribute('height', height - offset * 2 - 2 * ANIMATION_CONFIG.PADDING - 0.5);
		rect.setAttribute('rx', ANIMATION_CONFIG.BORDER_RADIUS);
		rect.setAttribute('ry', ANIMATION_CONFIG.BORDER_RADIUS);
		rect.setAttribute('stroke-dasharray', perimeter);
		rect.setAttribute('stroke-dashoffset', perimeter);
		return rect;
	}
	function createSVGContainer(width, height) {
var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'snake-svg-container');
		svg.setAttribute('width', width);
		svg.setAttribute('height', height);
		svg.style.setProperty('--snake-animation-duration', ANIMATION_CONFIG.DURATION + 'ms');
		svg.style.setProperty('--snake-fade-duration', ANIMATION_CONFIG.FADE_DURATION + 'ms');
		return svg;
	}
	function focusIframeContent(iframe) {
		try {
			var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
			var iframeBody = iframeDoc.body;
			if (iframeBody) {
				iframeBody.focus();
				return true;
			}
		} catch (e) {
			iframe.focus();
		}
		return false;
	}
	function setFocusOnElement(element) {
		if (!element) {
			return;
		}
		if (element.tagName === 'IFRAME') {
			focusIframeContent(element);
		} else {
			element.focus();
		}
	}
	function cleanupAnimation(element, svg) {
		element.classList.remove('snake-highlight');
		if (svg.parentNode) {
			svg.parentNode.removeChild(svg);
		}
	}
	function setupAnimationLifecycle(element, svg, rect, focusElement, cfg) {
		var didFadeStart = false;
		var didCleanup = false;
		function startFadeOut() {
			if (didFadeStart) {
				return;
			}
			didFadeStart = true;
			svg.classList.add('snake-fade-out');
		}
		function cleanupAndFocus() {
			if (didCleanup) {
				return;
			}
			didCleanup = true;
			cleanupAnimation(element, svg);
			setTimeout(function() {
				setFocusOnElement(focusElement);
			}, cfg.FOCUS_BUFFER);
		}
		function scheduleFallbacks() {
			var fadeStartFallback = cfg.DURATION + cfg.STAY_VISIBLE + cfg.CLEANUP_BUFFER;
			var removeTimeFallback = fadeStartFallback + cfg.FADE_DURATION;
			setTimeout(function() {
				startFadeOut();
			}, fadeStartFallback);
			setTimeout(function() {
				cleanupAndFocus();
			}, removeTimeFallback);
		}
		function wireAnimationEvents() {
			rect.addEventListener('animationend', function(e) {
				if (e.animationName !== 'snakeDraw') {
					return;
				}
				setTimeout(function() {
					startFadeOut();
				}, cfg.STAY_VISIBLE + cfg.CLEANUP_BUFFER);
			}, { once: true });
			function onSvgAnimationEnd(e) {
				if (e.animationName !== 'fadeOut') {
					return;
				}
				svg.removeEventListener('animationend', onSvgAnimationEnd);
				cleanupAndFocus();
			}
			svg.addEventListener('animationend', onSvgAnimationEnd);
		}
		wireAnimationEvents();
		scheduleFallbacks();
	}
	function animateBorder(element, animationDisabled) {
		element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(function() {
			element.classList.add('snake-highlight');
			var cfg = ANIMATION_CONFIG;
			var width = element.clientWidth;
			var height = element.clientHeight + (cfg.PADDING * 2);
			var perimeter = animationDisabled ? 0 : (width + height) * 2;
			var svg = createSVGContainer(width, height);
			var rect = createSVGRect(width, height, perimeter);
			requestAnimationFrame(function() {
				if (animationDisabled) {
					rect.setAttribute('stroke-dashoffset', 0);
				}
				svg.appendChild(rect);
				element.appendChild(svg);
			});
			setupAnimationLifecycle(element, svg, rect, element, cfg);
		}, ANIMATION_CONFIG.SCROLL_BUFFER);
	}
	function switchToTabContainingElement(citationField) {
		try {
			var tabName = g_form.getTabNameForField(citationField);
			g_form.activateTab(tabName);
			return true;
		} catch (e) {
			return false;
		}
	}
	function createSnakeAnimation(activityEventSysId, animationDisabled, citationField) {
		var selector = '[data-journal-id="' + activityEventSysId + '"]';
		var element = document.querySelector(selector);
		if (!element || !switchToTabContainingElement(citationField)) {
			g_form.addInfoMessage(getMessage("The source may be hidden in your current view. Try resetting your user preferences, or contact your admin for assistance."));
			setTimeout(function() {
				g_form.clearMessages();
			}, 15000);
			return;
		}
		setTimeout(function() {
			animateBorder(element, animationDisabled);
		}, ANIMATION_CONFIG.TAB_SWITCH_BUFFER);
	}
	function getCitationEventTypeFromPayload(citationPayload) {
		var eventType = citationPayload && citationPayload.type;
		if (eventType && eventType.length > 0) {
			return eventType;
		}
		return '';
	}
	function getCitationSysIdFromPayload(citationPayload) {
		var activityEventSysId = citationPayload && citationPayload.activitySysId;
		if (activityEventSysId && activityEventSysId.length > 0) {
			return activityEventSysId;
		}
		return '';
	}
	function bindCitationLinkClickedEventOnce() {
		if (window.NOW && window.NOW.StreamCitationAnimation && window.NOW.StreamCitationAnimation._nacmCitationEventBound) {
			return;
		}
		function onCitationLinkClicked(e) {
			var detail = (e && e.detail) ? e.detail : {};
			var recordTable = detail.table || (window.g_form && typeof g_form.getTableName === 'function' ? g_form.getTableName() : '');
			var citationField = '';
			var eventType = '';
			var activityEventSysId = '';
			try {
				activityEventSysId = getCitationSysIdFromPayload(detail.citationPayload);
				eventType = getCitationEventTypeFromPayload(detail.citationPayload);
			} catch (error) {
console.error('Failed to decode/parse citation payload', error);
				return;
			}
			if (!recordTable || !activityEventSysId || !eventType) {
				return;
			}
			citationField = recordTable + "." + eventType;
			if (window.NOW && window.NOW.StreamCitationAnimation && typeof window.NOW.StreamCitationAnimation.init === 'function') {
				window.NOW.StreamCitationAnimation.init(activityEventSysId, citationField);
			}
		}
		window.addEventListener('nacmCitationLinkClicked', onCitationLinkClicked);
		window.NOW = window.NOW || {};
		window.NOW.StreamCitationAnimation = window.NOW.StreamCitationAnimation || {};
		window.NOW.StreamCitationAnimation._nacmCitationEventBound = true;
	}
	window.NOW = window.NOW || {};
	window.NOW.StreamCitationAnimation = {
		init: function(activityEventSysId, citationField) {
			if (activityEventSysId && citationField) {
				createSnakeAnimation(activityEventSysId, window.NOW.animationDisabled, citationField);
			}
		}
	};
	bindCitationLinkClickedEventOnce();
})();
;
