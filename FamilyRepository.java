package com.wardmanagement.repository;

import com.wardmanagement.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {
    List<Family> findByZone(Integer zone);
    List<Family> findByFamilyNameContainingIgnoreCase(String familyName);
}