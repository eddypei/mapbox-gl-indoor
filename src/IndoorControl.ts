import Indoor from './Indoor';
import IndoorMap from './IndoorMap';

import type { Level } from './types';

/**
 * Creates a indoor control with floors buttons

 * @implements {IControl}
 */
class IndoorControl {

    _indoor: Indoor;
    _indoorMap: IndoorMap | null;

    _container: HTMLElement | null;
    _levelsButtons: Array<HTMLElement>;
    _selectedButton: HTMLElement | null;

    constructor(indoor: Indoor) {
        this._indoor = indoor;
        this._levelsButtons = [];
        this._container = null;
        this._selectedButton = null;
    }

    onAdd() {
        // Create container
        this._container = document.createElement("div");
        this._container.classList.add("mapboxgl-ctrl");
        this._container.classList.add("mapboxgl-ctrl-group");
        this._container.addEventListener('contextmenu', this._onContextMenu);

        // If indoor layer is already loaded, update levels
        this._indoorMap = this._indoor.getSelectedMap();
        if (this._indoor.getSelectedMap() !== null) {
            this._updateNavigationBar()
            this._setSelected(this._indoor.getLevel());
        }

        // Register to indoor events
        this._indoor.on('map.loaded', this._onMapLoaded);
        this._indoor.on('map.unloaded', this._onMapUnLoaded);
        this._indoor.on('level.changed', this._onLevelChanged);

        return this._container;
    }

    onRemove() {
        this._container = null;
        this._indoor.off('map.loaded', this._onMapLoaded);
        this._indoor.off('map.unloaded', this._onMapUnLoaded);
        this._indoor.off('level.changed', this._onLevelChanged);
    }

    _onMapLoaded = ({ indoorMap }: { indoorMap: IndoorMap }): void => {
        this._indoorMap = indoorMap;
        this._updateNavigationBar();
    }

    _onMapUnLoaded = (): void => {
        this._indoorMap = null;
        this._updateNavigationBar();
    }

    _onLevelChanged = ({ level }: { level: Level | null }): void => this._setSelected(level);

    _updateNavigationBar() {

        if (this._container === null) {
            return;
        }

        if (this._indoorMap === null) {
            this._container.style.visibility = 'hidden';
            return;
        }

        this._container.style.visibility = 'visible';

        this._levelsButtons = [];
        while (this._container.firstChild) {
            this._container.removeChild(this._container.firstChild);
        }

        const range = this._indoorMap.levelsRange;
        for (let i = range.min; i <= range.max; i++) {
            this._levelsButtons[i] = this._createLevelButton(this._container, i);
        }
    }

    _setSelected(level: Level | null) {

        if (this._levelsButtons.length === 0) {
            return;
        }

        if (this._selectedButton) {
            this._selectedButton.style.fontWeight = "normal";
        }
        if (level !== null && this._levelsButtons[level]) {
            this._levelsButtons[level].style.fontWeight = "bold";
            this._selectedButton = this._levelsButtons[level];
        }
    }

    _createLevelButton(container: HTMLElement, level: Level) {
        const a = document.createElement("button");
        a.innerHTML = level.toString();
        a.classList.add("mapboxgl-ctrl-icon");
        container.appendChild(a);
        a.addEventListener('click', () => {
            if (this._indoor.getLevel() === level) return;
            this._indoor.setLevel(level);
        });
        return a;
    }

    _onContextMenu(e: Event) {
        e.preventDefault();
    }

}

export default IndoorControl;