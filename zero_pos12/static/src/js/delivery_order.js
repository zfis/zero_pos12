odoo.define('zero_pos12.models', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var core = require('web.core');
var rpc = require('web.rpc');
var models = require('point_of_sale.models');
var session = require('web.session');
var QWeb = core.qweb;
var _t = core._t;

models.load_models({
    model:  'pos.delivery',
    fields: ['name', 'partner_id','date_order','amount_total','lines','state'],
    domain: [['state','=','draft']],
    loaded: function(self, deliveries){
        self.deliveries = deliveries;
        }
    });

    models.load_models({
    model:  'pos.delivery.line',
    fields: ['product_id', 'qty'],
    loaded: function(self, delivery_lines){
        self.delivery_lines = delivery_lines;
        }
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        export_as_JSON: function() {
            var data = _super_order.export_as_JSON.apply(this, arguments);
            data.delivery_ref = this.delivery_ref;
            return data;
        },
        init_from_JSON: function(json) {
            this.delivery_ref = json.delivery_ref;
            _super_order.init_from_JSON.call(this, json);
        },
    });

    var posmodel_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        _save_to_server: function (orders, options) {
            if (!orders || !orders.length) {
                var result = $.Deferred();
                result.resolve([]);
                return result;
            }
            options = options || {};
            var self = this;
            var fields = _.find(this.models,function(model){ return model.model === 'pos.delivery'; }).fields;
            var timeout = typeof options.timeout === 'number' ? options.timeout : 7500 * orders.length;
            var order_ids_to_sync = _.pluck(orders, 'id');
            var args = [_.map(orders, function (order) {
                    order.to_invoice = options.to_invoice || false;
                    return order;
                })];
            return rpc.query({
                    model: 'pos.order',
                    method: 'create_from_ui',
                    args: args,
                    kwargs: {context: session.user_context},
                }, {
                    timeout: timeout,
                    shadow: !options.to_invoice
                })
                .then(function (server_ids) {
                    console.log(server_ids)
                    if (server_ids[1].length != 0){
                        console.log("dddddddddddddd")
                        for (var item in server_ids[1]){
                            rpc.query({
                                model: 'pos.delivery',
                                method: 'search_read',
                                args: [[['id', '=', server_ids[1][item]]], fields],
                                limit: 1,
                            }).then(function (delivery){
                            console.log(delivery)
                            var index = self.deliveries.indexOf(delivery[0]);
                            console.log(index)
                            self.deliveries.splice(index, 1);
                            });
                        }
                    }
                    _.each(order_ids_to_sync, function (order_id) {
                        self.db.remove_order(order_id);
                    });
                    self.set('failed',false);
                    return server_ids[0];
                }).fail(function (type, error){
                    if(error.code === 200 ){
                        if (error.data.exception_type == 'warning') {
                            delete error.data.debug;
                        }
                        if ((!self.get('failed') || options.show_error) && !options.to_invoice) {
                            self.gui.show_popup('error-traceback',{
                                'title': error.data.message,
                                'body':  error.data.debug
                            });
                        }
                        self.set('failed',error);
                    }
                    console.error('Failed to send orders:', orders);
                });
        }
    });

});
