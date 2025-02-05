import React from 'react';
import './Instruction.css';

export default function Instruction() {
  return (
    <div className="instruction-container">
      <h1 className="instruction-title">Instructions</h1>
      <ul className="instruction-list">
        <li>Two fingers to select</li>
        <li>Index finger to draw</li>
        <li>Thumb up to scroll up</li>
        <li>Thumb down to scroll down</li>
        <li>Swipe left to go to the previous slide</li>
        <li>Swipe right to go to the next slide</li>
      </ul>
    </div>
  );
}
