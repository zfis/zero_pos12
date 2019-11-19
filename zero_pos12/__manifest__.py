# -*- coding: utf-8 -*-
#############################################################################
#
#              Zero For Information Systems.
#
#  Copyright (C) 2019-TODAY Zero Systems(<https://www.erpzero.com>).
#
#  Author:Zero Systems(<https://www.erpzero.com>).
#
# All Rights Reserved.
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
#############################################################################
{
    'name': 'POS Restaurant and Retail',
    'version': '1.0',
    'category': 'Point of Sale',
    'summary': 'Manage Restaurant and or Retail Point of Sale',
    'description': """ Most of Restaurant and Retail Point of Sale needs as the following 
    - Credit Sales on POS avilable with POS Credit Journal
    - Gift and coupons
    - Multi Order Note
    - Product Category Filter
    - Manage Delevery orders
    - Restrict users (allows to specify pos config for specific users)
    - Service Charge % or Amount 
    - Avilable stock Qty per each point of sale stock location
    - Session Summary Reports
    - Works on odoo community and enterprise 12
    - All Features Work on Odoo POS offline Mode 
    
    
    Note: you must enable (Show Full Accounting Features) for administrator befor installation but if you forget that
     then you can enable (Show Full Accounting Features) after installation and then upgrade our module """,
    'author': 'Zero Systems,Cybrosys Techno Solutions,sitaram,D.Jane,Fauniq,Odoo Mates',
    'website': "https://www.erpzero.com",
    'company': 'Zero For Information Systems',
    'depends': ['base','point_of_sale','pos_restaurant','barcodes','account'],
    'data': [
             'data/data.xml',
             'views/gift_voucher.xml','views/coupons.xml',
             'views/multi_note_order_backend.xml', 
             'views/product_category_filter.xml',
             'views/delivery_order.xml',
             'views/res_users_restrict.xml',
             'views/service_charge.xml',
             'views/stock_qty_pos_config_view.xml',    
             'report/print_session_report_template.xml',
             'report/print_session_pos_report.xml',
             'report/report_session_summary.xml',
             'report/session_summary_report.xml',
             'security/pos_user_restrict_security.xml',
             'security/ir.model.access.csv'
            ],
    'qweb': [
            'static/src/xml/coupons.xml',
            'static/src/xml/delivery_order.xml',
            'static/src/xml/service_charge.xml',
            'static/src/xml/pos_internal_note.xml',
            'static/src/xml/stock_qty_pos_stock.xml',
            'static/src/xml/traceability_validation_templates.xml',
            'static/src/xml/traceability_validation_ticket_view.xml'],
    'images': ['static/description/logo.PNG'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
