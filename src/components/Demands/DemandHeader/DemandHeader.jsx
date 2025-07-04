import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import SortSelect from '../../public/SortSelect';
import { SORT_OPTIONS } from '../../../utils/demandUtils';
import './DemandHeader.css';

const DemandHeader = ({ orderBy, setOrderBy }) => {
    return (
        <div className="demand-header">
            <div className="demand-icon">
                <SlSocialDropbox className="demandbox-icon"/>
                <FaHeart className="heart-icon"/>
            </div>
            <h2 className="demand-heading">수요조사</h2>
            <div className="sort-container">
                <SortSelect 
                    options={SORT_OPTIONS} 
                    selected={orderBy} 
                    onChange={setOrderBy}
                />
            </div>
        </div>
    );
};

export default DemandHeader; 