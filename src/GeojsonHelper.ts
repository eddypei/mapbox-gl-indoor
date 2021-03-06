import { LngLatBounds } from 'mapbox-gl';
import bbox from '@turf/bbox';

import type { BBox2d } from '@mapbox/geojson-types';
import type { Feature, GeoJSON } from 'geojson';
import type { LevelsRange } from './types';

/**
 * Helper for Geojson data
 */
class GeoJsonHelper {

    /**
     * Extract level from feature
     *
     * @param {GeoJSONFeature} feature geojson feature
     * @returns {LevelsRange | number | null} the level or the range of level.
     */
    static extractLevelFromFeature(feature: Feature): (LevelsRange | number | null) {
        if (!!feature.properties &&
            feature.properties.level !== null) {
            const propertyLevel = feature.properties['level'];
            if (typeof propertyLevel === 'string') {
                const splitLevel = propertyLevel.split(';');
                if (splitLevel.length === 1) {
                    const level = parseFloat(propertyLevel);
                    if (!isNaN(level)) {
                        return level;
                    }
                } else if (splitLevel.length === 2) {
                    const level1 = parseFloat(splitLevel[0]);
                    const level2 = parseFloat(splitLevel[1]);
                    if (!isNaN(level1) && !isNaN(level2)) {
                        return {
                            min: Math.min(level1, level2),
                            max: Math.max(level1, level2)
                        };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Extract levels range and bounds from geojson
     *
     * @param {GeoJSON} geojson the geojson
     * @returns {Object} the levels range and bounds.
     */
    static extractLevelsRangeAndBounds(geojson: GeoJSON): ({ levelsRange: LevelsRange, bounds: LngLatBounds }) {

        let minLevel = Infinity;
        let maxLevel = -Infinity;

        const bounds = LngLatBounds.convert(bbox(geojson) as BBox2d)

        const parseFeature = (feature: Feature): void => {
            const level = this.extractLevelFromFeature(feature);
            if (level === null) {
                return;
            }
            if (typeof level === 'number') {
                minLevel = Math.min(minLevel, level);
                maxLevel = Math.max(maxLevel, level);
            } else if (typeof level === 'object') {
                minLevel = Math.min(minLevel, level.min);
                maxLevel = Math.max(maxLevel, level.max);
            }
        };

        if (geojson.type === 'FeatureCollection') {
            geojson.features.forEach(parseFeature);
        } else if (geojson.type === 'Feature') {
            parseFeature(geojson);
        }

        if (minLevel === Infinity || maxLevel === -Infinity) {
            throw new Error('No level found');
        }
        return {
            levelsRange: { min: minLevel, max: maxLevel },
            bounds
        };
    }
}
export default GeoJsonHelper;
