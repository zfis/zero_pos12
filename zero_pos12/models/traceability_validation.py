# -*- coding: utf-8 -*-

from odoo import models, api


class ValidateLotNumber(models.Model):
    _name = 'serial_no.validation'

    @api.model
    def validate_lots(self, lots):
        processed = []
        LotObj = self.env['stock.production.lot']
        print("ddd",LotObj)
        for lot in lots:
            lot_id = LotObj.search([('name', '=', lot)], limit=1)
            try:
                if lot_id.product_qty > 0 and lot not in processed:
                    processed.append(lot)
                    continue
                else:
                    if lot in processed:
                        return ['duplicate', lot]
                    else:
                        return ['no_stock', lot]
            except Exception:
                return ['except', lot]
        return True

