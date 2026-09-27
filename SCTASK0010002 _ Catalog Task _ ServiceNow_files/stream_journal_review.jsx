/*! RESOURCE: /scripts/stream_journal_review.js */
(function() {
	'use strict';
	window.NOW = window.NOW || {};
	window.NOW.StreamJournalReview = {
		init: function(createdBy) {
			if (window.NOW.snActivityStreamJournalUnderReview === window.NOW.snActivityStreamCitedActivity) {
				return;
			}
			var message = getMessage('{0} has updated fields and work notes. Please review the work notes and fields for accuracy.').replace('{0}', createdBy);
var viewLink = '<a href="' + getCitationUrl() +'" target="_self" style="margin-inline: 10px">' + getMessage('Review work notes') +'</a>';
			GlideUIDefault.display({
				sticky: true,
				text: message + viewLink,
				type: 'success'
			});
		}
	};
	function getCitationUrl() {
		var currentUrl = window.location.href;
var baseURL = currentUrl.replace(/(&|%26)?sysparam_citation(=|%3D)({|%7B).+(}|%7D)/, '');
		var citation = encodeURIComponent('{"activitySysId":"' + window.NOW.snActivityStreamJournalUnderReview + '"}');
		return baseURL + '&sysparam_citation=' + citation;
	}
})();
;
