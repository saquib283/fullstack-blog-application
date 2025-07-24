"use client"
import { useParams } from "next/navigation";
import React from "react";



export default function page(){
    const params = useParams();
    const id = params.id;
    return(
        <h1>Hellow dear</h1>
    )
}