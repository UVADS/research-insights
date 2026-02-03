export const updateLegend = (data, colorMode, getSponsorCategory, getAwardedStatus, getFieldCategory, colorScale, categoryColorScale, statusColorScale, amountColorScale, amountExtent, highlightedCategories, toggleCategoryHighlight) => {
    const legendContainer = d3.select("#legend");
    legendContainer.select(".legend-items").remove();
    const legend = legendContainer.append("div").attr("class", "legend-items");

    if(colorMode === 'research category') {
        legend.append("p").text("click on toggles above to highlight corresponding points").attr("style", "font-size: 14px;");
        const groupedCounts = d3.rollup(
            data,
            v => v.length, 
            d => d['Type'] 
        );

        const sortedCategories = Array.from(groupedCounts, ([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

        sortedCategories.forEach(item => {
            const category = item.category;
            const color = colorScale(category);
            const itemDiv = legend.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px")
                .style("cursor", "not-allowed");

            itemDiv.append("div").style("width", "12px").style("height", "12px").style("background-color", color).style("margin-right", "10px").style("opacity", "0.94");
            itemDiv.append("span").text(category).style("font-size", "16px");
        });
    }
    else if (colorMode === 'direct sponsor' || colorMode === 'prime sponsor' || colorMode === 'mixed sponsor') {
        const noneSelected = highlightedCategories.length === 0;
        legend.append("p").text("click on a category to highlight corresponding points.").attr("style", "font-size: 14px;");
        const filteredDataForLegend = data.filter(d => 
            d.Type === 'proposal'
        );
        const groupedCounts = d3.rollup(
            filteredDataForLegend,
            v => v.length, 
            d => getSponsorCategory(d, colorMode)
        );

        const sortedCategories = Array.from(groupedCounts, ([category, count]) => ({ category, count }))
            .sort((a, b) => {
                if (a.category === 'missing') return 1;
                if (b.category === 'missing') return -1;
                if (a.category === 'other') return 1;
                if (b.category === 'other') return -1;
                return b.count - a.count;
            });
        
        sortedCategories.forEach(item => {
            const category = item.category;
            const isActive = highlightedCategories.includes(category);
            const color = category === 'missing' ? '#abababff' : categoryColorScale(category);
            const itemDiv = legend.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px")
                .style("cursor", "pointer")
                .on("click", () => toggleCategoryHighlight(category));
            if (!noneSelected) {
                itemDiv.attr("class", `legend-item ${!isActive ? 'inactive-highlight' : ''}`)
            }

            itemDiv.append("div").style("width", "12px").style("height", "12px").style("background-color", color).style("margin-right", "10px").style("opacity", "0.94");
            itemDiv.append("span").text(category).style("font-size", "16px");
        });
    }
    else if (colorMode === 'proposal status') {
        const noneSelected = highlightedCategories.length === 0;
        legend.append("h3").text("click on a category to highlight corresponding points.").attr("style", "font-size: 14px;");
        const awardCategory = d3.rollup(data, v => v.length, getAwardedStatus);

        const sortedAwardCategory = Array.from(awardCategory, ([category, count]) => ({category, count}))
            .sort((a,b) => {
                if (a.category === 'other') return 1;
                if (b.category === 'other') return -1;
                return b.count - a.count;
            });

        sortedAwardCategory.forEach(item => {
            const category = item.category;
            const awardActive = highlightedCategories.includes(category);
            const color_awarded = statusColorScale(category);

            const itemDiv = legend.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px")
                .style("cursor", "pointer")
                .on("click", () => toggleCategoryHighlight(category));
            if (!noneSelected) {
                itemDiv.attr("class", `legend-item ${!awardActive ? 'inactive-highlight' : ''}`)
            }
            itemDiv.append("div").style("width", "12px").style("height", "12px").style("background-color", color_awarded).style("margin-right", "10px").style("opacity", "0.94");
            itemDiv.append("span").text(category).style("font-size", "16px");
            });
        }
    else if (colorMode === 'amount awarded') {
        legend.append("h3").text("Logged Amount").attr("style", "font-size: 14px; margin-bottom: 5px;");
        const legendSvg = legend.append("svg").attr("width", 550).attr("height", 50);
        const defs = legendSvg.append("defs");
        
        const linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
        
        const stops = d3.range(0, 1.1, 0.1).map(t => ({
            offset: `${t * 100}%`,
            color: d3.interpolateGnBu(0.1 + (0.9 * t)) 
        }));
        linearGradient.selectAll("stop")
            .data(amountColorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: amountColorScale(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
        
        legendSvg.append("rect").attr("width", 500).attr("height", 20).style("fill", "url(#linear-gradient)");

        const logDomain = [1, amountExtent[1]];

        const positionScale = d3.scaleLog()
            .domain(logDomain) 
            .range([0, 500]); 

        let intermediateTicks = [];
        let currentPower = 1; 
        while (currentPower < amountExtent[1]) {
            if (currentPower >= logDomain[0]) {
                intermediateTicks.push(currentPower);
            }
            currentPower *= 10;
        }
        legendSvg.selectAll(".legend-tick")
            .data(intermediateTicks)
            .enter().append("line")
            .attr("class", "legend-tick")
            .attr("x1", d => positionScale(d))
            .attr("y1", 20) 
            .attr("x2", d => positionScale(d))
            .attr("y2", 25) 
            .attr("stroke", "#333")
            .attr("stroke-width", 1);

        legendSvg.selectAll(".legend-label")
            .data(intermediateTicks)
            .enter().append("text")
            .attr("class", "legend-label")
            .attr("x", d => positionScale(d))
            .attr("y", 40) 
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(d3.format("$,.0s"));

        legendSvg.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("font-size", "10px")
            .text(d3.format("$,.0s")(1)) 
            .attr("text-anchor", "start");

        legendSvg.append("text")
            .attr("x", 520) 
            .attr("y", 40)
            .attr("font-size", "10px")
            .attr("text-anchor", "end")
            .text(d3.format("$,.0s")(amountExtent[1]));

        legendSvg.append("line").attr("x1", 0).attr("y1", 20).attr("x2", 0).attr("y2", 25).attr("stroke", "#333").attr("stroke-width", 1);
        legendSvg.append("line").attr("x1", 500).attr("y1", 20).attr("x2", 500).attr("y2", 25).attr("stroke", "#333").attr("stroke-width", 1);
    }
    else if (colorMode === 'field') {
        const noneSelected = highlightedCategories.length === 0;
        legend.append("h3").text("click on a category to highlight corresponding points. scroll for more.").attr("style", "font-size: 14px;");
        
        const fieldData = data.filter(d => d.Type !== 'author');

        const groupedCounts = d3.rollup(
            fieldData,
            v => v.length, 
            d => getFieldCategory(d)
        );

        const sortedCategories = Array.from(groupedCounts, ([category, count]) => ({ category, count }))
            .sort((a, b) => {
                if (a.category === 'missing') return 1;
                if (b.category === 'missing') return -1;
                if (a.category === 'other') return 1;
                if (b.category === 'other') return -1;
                return b.count - a.count;
            });
        
        sortedCategories.forEach(item => {
            const category = item.category;
            const isActive = highlightedCategories.includes(category);
            const color = category === 'other' ? '#abababff' : categoryColorScale(category);
            const itemDiv = legend.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px")
                .style("cursor", "pointer")
                .on("click", () => toggleCategoryHighlight(category));
            if (!noneSelected) {
                itemDiv.attr("class", `legend-item ${!isActive ? 'inactive-highlight' : ''}`)
            }

            itemDiv.append("div").style("width", "12px").style("height", "12px").style("background-color", color).style("margin-right", "10px").style("opacity", "0.94");
            itemDiv.append("span").text(category).style("font-size", "16px");
        });
    }
};