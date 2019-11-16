odoo.define('zero_pos12.barcode',function(require) {
	"use strict";
	var screens = require('point_of_sale.screens');
	screens.ScreenWidget.include({
		barcode_product_action: function(code){
	        var self = this;
	        var product = this.pos.db.get_product_by_barcode(code.base_code);
	        
	        if(product.to_weight && this.pos.config.iface_electronic_scale){
	        	return this.gui.show_screen('scale',{product: product});
	        }
	        
	        if (self.pos.scan_product(code)) {
	            if (self.barcode_product_screen) {
	                self.gui.show_screen(self.barcode_product_screen, null, null, true);
	            }
	        } else {
	            this.barcode_error_action(code);
	        }
	    },
		
	});
});
