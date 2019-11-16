odoo.define('zero_pos12.pos_delivery_order', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var core = require('web.core');
var rpc = require('web.rpc');
var PopupWidget = require('point_of_sale.popups');
var ProductListWidget = screens.ProductListWidget;
var ScreenWidget = screens.ScreenWidget;
var QWeb = core.qweb;
var _t = core._t;

var DeliveryPopupWidget = PopupWidget.extend({
    template: 'DeliveryPopupWidget',
    events: _.extend({}, PopupWidget.prototype.events,{
        "keyup .order_date" : "date_validate",
    }),
    show: function(options){
        options = options || {};
        var self = this;
        this._super(options);
        this.renderElement();
    },
    date_validate: function(){
        var v = $(".order_date").val();
        if (v.match(/^\d{4}$/) !== null) {
            $(".order_date").val(v + '/');
            }
        else if (v.match(/^\d{4}\/\d{2}$/) !== null) {
            $(".order_date").val(v + '/');
            }
        },
    click_confirm: function(){
        var self = this;
        var new_delivery = [];
        var fields = _.find(this.pos.models,function(model){ return model.model === 'pos.delivery'; }).fields;
        var line_fields = _.find(this.pos.models,function(model){ return model.model === 'pos.delivery.line'; }).fields;
        var today = new Date().toJSON().slice(0,10);
        var order = this.pos.get_order();
        var order_to_save = order.export_as_JSON();
        var order_lines = this.pos.get_order().get_orderlines();
        var order_date = this.$('.order_date').val();
        var order_note = this.$('.order_note').val();
        var valid_date = true;
        var validatePattern = /^(\d{4})([/|-])(\d{1,2})([/|-])(\d{1,2})$/;
        if (order_date){
            var dateValues = order_date.match(validatePattern);
            if (dateValues == null){
                valid_date = false;
            }
            else{
                var orderYear = dateValues[1];
                var orderMonth = dateValues[3];
                var orderDate =  dateValues[5];
                if ((orderMonth < 1) || (orderMonth > 12)) {
                    valid_date = false;
                }
                else if ((orderDate < 1) || (orderDate> 31)) {
                    valid_date = false;
                }
                else if ((orderMonth==4 || orderMonth==6 || orderMonth==9 || orderMonth==11) && orderDate ==31) {
                    valid_date = false;
                }
                else if (orderMonth == 2){
                    var isleap = (orderYear % 4 == 0 && (orderYear % 100 != 0 || orderYear % 400 == 0));
                    if (orderDate> 29 || (orderDate ==29 && !isleap)){
                        valid_date = false;
                    }
                }
                var dates = [orderYear,orderMonth,orderDate];
                order_date = dates.join('-');
            }
        }
        $('.alert_msg').text("");
        if (order_date && order_date < today || valid_date==false || !order_date){
            $('.alert_msg').text("Please Select Valid Order Date!");
        }
        else{
            $('.alert_msg').text("");
            if (order_date){
                order_to_save.date_order = order_date;
                }
            order_to_save.note = order_note;
            rpc.query({
                model: 'pos.delivery',
                method: 'create_from_ui',
                args: [order_to_save],
            })
            .then(function(order){
                rpc.query({
                    model: 'pos.delivery',
                    method: 'search_read',
                    args: [[['id', '=', order['id']]], fields],
                    limit: 1,
                })
                .then(function (delivery){
                    self.pos.deliveries.push(delivery[0]);
                     for (var line in delivery[0]['lines']){
                        rpc.query({
                            model: 'pos.delivery.line',
                            method: 'search_read',
                            args: [[['id', '=', delivery[0]['lines'][line]]], line_fields],
                            limit: 1,
                        }).then(function (delivery_line){
                        console.log(delivery_line);
                        self.pos.delivery_lines.push(delivery_line[0]);
                    });
                }
            });
            self.gui.close_popup();
            self.pos.delete_current_order();
            self.gui.show_popup('pos_delivery_result',{
            'body': _t('Delivery Ref : ')+ order['name'] ,
            });
        });
    }
    },

});
//
//var paymentscreen = screens.PaymentScreenWidget.extend({
//    template: 'paymentscreen',
//    click_set_customer: function(){
//        console.log("hhh")
//        this.gui.show_screen('clientlist');
//    },
//});

var DeliveryListScreenWidget = ScreenWidget.extend({
    template: 'DeliveryListScreenWidget',
    back_screen:   'product',
    init: function(parent, options){
        var self = this;
        this._super(parent, options);
    },

    show: function(){
        var self = this;
        this._super();
        this.renderElement();
        this.$('.back').click(function(){
            self.gui.back();
        });

        var deliveries = this.pos.deliveries;
        this.render_list(deliveries);

         this.$('.delivery-list-contents').delegate('.delivery-line .confirm_delivery','click',function(event){
            self.line_select(event,$(this.parentElement.parentElement),parseInt($(this.parentElement.parentElement).data('id')));
        });

        var search_timeout = null;

        if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
            this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
        }

        this.$('.searchbox input').on('keyup',function(event){
            clearTimeout(search_timeout);
            var query = this.value;
            search_timeout = setTimeout(function(){
                self.perform_search(query,event.which === 13);
            },70);
        });

        this.$('.searchbox .search-clear').click(function(){
            self.clear_search();
        });
    },

    render_list: function(deliveries){
        var contents = this.$el[0].querySelector('.delivery-list-contents');
        contents.innerHTML = "";
        for(var i = 0, len = Math.min(deliveries.length,1000); i < len; i++){
            var delivery    = deliveries[i];
            var delivery_line_html = QWeb.render('DeliveryLine',{widget: this, delivery:deliveries[i]});
            var delivery_line = document.createElement('tbody');
            delivery_line.innerHTML = delivery_line_html;
            delivery_line = delivery_line.childNodes[1];
            contents.appendChild(delivery_line);
        }
    },

    line_select: function(event,$line,id){
        var self = this;
        var order = this.pos.get_order();
        for (var delivery_id in this.pos.deliveries){
            if (this.pos.deliveries[delivery_id]['id'] == id){
                var selected_delivery = this.pos.deliveries[delivery_id]
            }
        }
        if (selected_delivery){
            for (var line in this.pos.delivery_lines){
                if (selected_delivery['lines'].indexOf(this.pos.delivery_lines[line]['id']) > -1 ){
                var product_id = this.pos.db.get_product_by_id(this.pos.delivery_lines[line]['product_id'][0]);
                this.pos.get_order().add_product(product_id,{ quantity: this.pos.delivery_lines[line]['qty']});
                }
            }
            order.delivery_ref = selected_delivery;
            if (selected_delivery.partner_id){
                var partner = this.pos.db.get_partner_by_id(selected_delivery.partner_id[0]);
                order.set_client(partner);
            }
            this.gui.show_screen('products');
        }

    },

    perform_search: function(query, associate_result){
        var deliveries;
        if(query){
            deliveries = this.search_delivery(query);
            this.render_list(deliveries);
        }else{
            deliveries = this.pos.deliveries;
            this.render_list(deliveries);
        }
    },
    clear_search: function(){
        var deliveries = this.pos.deliveries;
        this.render_list(deliveries);
        this.$('.searchbox input')[0].value = '';
        this.$('.searchbox input').focus();
    },

    search_delivery: function(query){
        try {
            var re = RegExp(query);
        }catch(e){
            return [];
        }
        var results = [];
        for (var delivery_id in this.pos.deliveries){
            var r = re.exec(this.pos.deliveries[delivery_id]['name']);
            if(r){
            results.push(this.pos.deliveries[delivery_id]);
            }
        }
        return results;
    },
});


gui.define_popup({name:'pos_delivery', widget: DeliveryPopupWidget});

var DeliveryResultPopupWidget = PopupWidget.extend({
    template: 'DeliveryResultPopupWidget',
});

gui.define_popup({name:'pos_delivery_result', widget: DeliveryResultPopupWidget});
gui.define_screen({name:'delivery_list', widget: DeliveryListScreenWidget});

var DeliveryListButton = screens.ActionButtonWidget.extend({
    template: 'DeliveryListButton',
    button_click: function(){
        this.gui.show_screen('delivery_list');
    }
});

screens.define_action_button({
    'name': 'pos_delivery_list',
    'widget': DeliveryListButton,
    'condition': function () {
        return this.pos.config.enable_delivery;
    }
});


var DeliveryButton = screens.ActionButtonWidget.extend({
    template: 'DeliveryButton',
    button_click: function(){
        var order_lines = this.pos.get_order().get_orderlines();
        var flag_negative = false;
        for (var line in order_lines){
            if (order_lines[line].quantity < 0){
                flag_negative = true;
            }
        }
        if(this.pos.get_order().get_orderlines().length > 0 && flag_negative == false && this.pos.get_order().get_total_with_tax()>0){
            this.gui.show_popup('pos_delivery');
        }
        else if(flag_negative == true){
            this.gui.show_popup('pos_delivery_result',{
                'body': _t('Invalid Order: Negative Quantity is Not Allowed'),
            });
        }
        else if(this.pos.get_order().get_orderlines().length == 0 || this.pos.get_order().get_total_with_tax() <=0){
            this.gui.show_popup('pos_delivery_result',{
            'body': _t('Invalid Order : Please Add Some Order Lines'),
            });
        }
    },
});

screens.define_action_button({
    'name': 'pos_delivery_order',
    'widget': DeliveryButton,
    'condition': function () {
        return this.pos.config.enable_delivery;
    }
});

});

