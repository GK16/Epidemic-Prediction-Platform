import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import React, { useCallback } from "react";

export default ({ option, style ,onRef}) => {
	const ref = useCallback(e => {
		if (e) {
			let _instance = e.getEchartsInstance();
			onRef && onRef(_instance);
		}
	}, []);
	return <ReactEcharts ref={ref} notMerge={true} echarts={echarts} option={option} style={style} />;
};
