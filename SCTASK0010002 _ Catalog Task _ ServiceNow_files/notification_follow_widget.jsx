/*! RESOURCE: /scripts/notification_follow_widget.js */
var NotificationFollowWidget = (function($) {
	var recordDetails = {},
		$widgetActionButton,
		followMessage,
		unfollowMessage,
		amFollowing;
var REST_API_PATH = '/api/now/follow_notifications';
	function setState(isFollowing) {
		amFollowing = isFollowing;
		var $label = $widgetActionButton.find('.action-button-label');
		var $hover = $widgetActionButton.find('.action-button-hover');
		if (amFollowing) {
			$label.text($widgetActionButton.attr('data-following-label'));
			$hover.text($widgetActionButton.attr('data-unfollow-label'));
			$hover.attr('data-now-ux-metrics-event', 'Unfollow Record');
		} else {
			$label.text($widgetActionButton.attr('data-follow-label'));
			$hover.text($widgetActionButton.attr('data-follow-label'));
			$hover.attr('data-now-ux-metrics-event', 'Follow Record');
		}
	}
	function getAPI(endpoint) {
		var data = {
			sysparm_table: recordDetails.table,
			sysparm_sysid: recordDetails.sysID,
			sysparm_userid: g_user.userID,
			sysparm_operation: endpoint
		};
		return {
url: REST_API_PATH + '/action',
			type: 'post',
			data: JSON.stringify(data),
contentType: 'application/json'
		};
	}
	function setFollow() {
		return $.ajax(getAPI('add')).done(function(notificationId) {
			setState(true);
			g_form.addInfoMessage(followMessage, 'follow_notification');
		});
	}
	function setUnfollow() {
		return $.ajax(getAPI('delete')).done(function(response) {
			setState(false);
			g_form.addInfoMessage(unfollowMessage, 'unfollow_notification');
		});
	}
	return {
		init: function(record, currentlyFollowing, followMsg, unfollowMsg) {
			recordDetails = record;
			$widgetActionButton = $('#notificationFollowWidgetAction');
			followMessage = htmlEscape(followMsg);
			unfollowMessage = htmlEscape(unfollowMsg);
			setState(currentlyFollowing);
			$widgetActionButton.on('click', function(event) {
				if (amFollowing) setUnfollow();
				else setFollow();
			});
		},
		follow: setFollow,
		unfollow: setUnfollow
	};
})(window.jQuery);
;
