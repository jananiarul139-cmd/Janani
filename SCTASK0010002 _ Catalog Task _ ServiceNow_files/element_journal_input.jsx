/*! RESOURCE: /scripts/doctype/element_journal_input.js */
(function($){
	var GlideJournalInput = Class.create({
		initialize: function(id){
			this.id = id;
			this.elem = document.getElementById(this.id);
		},
		setValue: function(newValue){
			if (newValue == 'XXmultiChangeXX'){
				newValue = '';
			}
			$(this.elem)
				.val(newValue)
				.trigger("autosize.resize");
			onChange(this.id);
		},
		type: "GlideJournalInput",
		z: null
	});
	CachedEvent.after('glideform.initialized', activate);
	function activate(){
		var elems = $('[data-type="glide_journal_input"]');
		elems.each(function(index, elem) {
			var ref = $(elem).attr('data-ref');
			if (g_form.elementHandlers[ref])
				return;
			if (ref && elem) {
				var gjiHandler = new GlideJournalInput(ref);
				g_form.registerHandler(ref, gjiHandler);
				return gjiHandler;
			}
		});
	}
})(window.jQuery);
;
