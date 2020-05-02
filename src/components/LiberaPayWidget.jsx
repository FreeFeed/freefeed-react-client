import React, { useEffect, useState, useCallback } from "react";

export function LiberaPayWidget({ project, updateInterval = 1200000 }) {
  const [{ receiving, goal }, setData] = useState({
    giving: "-.--",
    goal: "--.--"
  });

  const update = useCallback(() => {
    loadLiberaPayData(project)
      .then(result => {
        if (!result.receiving) {
          throw new Error("Invalid response format");
        }
        setData({
          receiving: formatSum(result.receiving),
          goal: formatSum(result.goal)
        });
      })
      .catch(err => {
        console.warn(`Cannot load LiberaPay data: ${err.message}`);
        // do nothing
      });
  }, [project]);

  useEffect(() => {
    update();
    const t = setInterval(update, updateInterval);
    return () => clearInterval(t);
  }, [update, updateInterval]);

  return (
    <a
      href={`https://liberapay.com/${project}/donate`}
      target="_blank"
      rel="noopener noreferrer"
      style={css(`border: 2px solid #f6c915; border-radius: 5px; color: #1a171b; background: white;
         display: inline-block;
         font-family: Helvetica Neue,Helvetica,sans-serif; font-size: 14px;
         max-width: 150px; min-width: 110px;
         position: relative; text-align: center; text-decoration: none;`)}
    >
      <span
        style={css(`background-color: #f6c915; display: block;
                 font-family: Ubuntu,Arial,sans-serif;
                 font-style: italic; font-weight: 700;
                 padding: 3px 7px 5px;`)}
      >
        <img
          src="https://liberapay.com/assets/liberapay/icon-v2_black.svg"
          height="20"
          width="20"
          style={css(`vertical-align: middle;`)}
          alt={project}
        />
        <span style={css(`vertical-align: middle;`)}>LiberaPay</span>
      </span>
      <span style={css(`display: block; padding: 5px 15px 2px;`)}>
        <span style={css(`color: #f6c915; position: absolute; left: -2px;`)}>
          &#10132;
        </span>
        We receive <br />
        <span style={css(`font-size: 125%`)}>{receiving}</span>
        <br /> per week,
        <br /> our goal is <br />
        <span style={css(`font-size: 125%`)}>{goal}</span>
      </span>
    </a>
  );
}

function loadLiberaPayData(project) {
  return fetch(`https://liberapay.com/${project}/public.json`, {cache: "reload"}).then(r =>
    r.json()
  );
}    

// Quick & dirty CSS parser
function css(cssText) {
  const regex = /([\w-]*)\s*:\s*([^;]*)/g;
  const result = {};
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(cssText)) !== null) {
    result[kebabToCamel(match[1])] = match[2].trim();
  }
  return result;
}

function kebabToCamel(text) {
  return text.replace(/-(\w)/g, x => x[1].toUpperCase());
}

function formatSum({ amount, currency }) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency
  }).format(amount);
}
