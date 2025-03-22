import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';

interface SportsListProps {
  sports: string[];
}

export default function SportsList() {
  const [selectedSport, setSelectedSport] = useState(null);
  const [sportsList, setSportsList] = useState([])

  useEffect(() => {
    const getData = async () => {
        try {
            const response = await fetch('http://localhost:5001/sports')
            const data = await response.json()
            setSportsList(data)
            console.log(data)
          }
        catch(err) {
            console.log('Shutup')
        }
    }
    getData()
  }, [])
  
    

  return (
    <div className="space-y-4">
        {sportsList.map((sport) => {
            return <h2>{sport}</h2>
        })}
        </div>
  )

}
