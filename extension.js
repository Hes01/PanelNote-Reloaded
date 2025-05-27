/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Inspired by the macOS app 'One Thing'
// Extension uses elements from 'Just Another Search Bar' (https://extensions.gnome.org/extension/5522/just-another-search-bar/)

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(settings) {
        super._init(0.0, _('Panel Note'));
        
        // Configuración del contenedor principal
        this.set_style('padding: 0px 8px;');

        /* ------------------------------- Panel Note ------------------------------- */
        let noteInPanel = new St.Label({
            text: settings.get_string('note'),
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.CENTER,
            style_class: 'panel-note-label'  // Clase CSS para controlar tamaño
        });
        this.add_child(noteInPanel);

        /* ----------------------------- Note Entry Box ----------------------------- */
        this.entry = new St.Entry({
            text: settings.get_string('note'),
            can_focus: true,
            track_hover: true,
            style_class: 'panel-note-entry'  // Clase CSS adicional
        });

        this.entry.set_primary_icon(new St.Icon({
            icon_name: 'document-edit-symbolic',
            style_class: 'popup-menu-icon',
        }));

        // Conexión segura de señal
        this._textChangedId = this.entry.clutter_text.connect('text-changed', () => {
            let text = this.entry.get_text();
            settings.set_string('note', text || "No Note");
            noteInPanel.text = text || "No Note";
        });

        let popupEdit = new PopupMenu.PopupMenuSection();
        popupEdit.actor.add_child(this.entry);
        this.menu.addMenuItem(popupEdit);
        this.menu.actor.add_style_class_name('note-entry');
    }

    // Limpieza segura
    destroy() {
        if (this._textChangedId) {
            this.entry.clutter_text.disconnect(this._textChangedId);
            this._textChangedId = null;
        }
        super.destroy();
    }

});

export default class PanelNoteExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new Indicator(this._settings);
        
        // Añadir al panel con posición explícita (GNOME 48+)
        Main.panel.addToStatusArea(this.uuid, this._indicator, 1, 'right');
    }

    disable() {
        if (this._indicator) {
            // Llama a la limpieza interna
            if (this._indicator) {
                this._indicator.destroy();
                this._indicator = null;
            }
        this._settings = null;

        }
    }
}