package com.wardmanagement.controller;

import com.wardmanagement.model.Request;
import com.wardmanagement.repository.RequestRepository;
import com.wardmanagement.repository.FamilyMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private FamilyMemberRepository memberRepository;

    @GetMapping
    public List<Request> getAllRequests() {
        return requestRepository.findAllByOrderByRequestDateDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Request> getRequestById(@PathVariable Long id) {
        return requestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Request> getRequestsByStatus(@PathVariable String status) {
        return requestRepository.findByStatus(status);
    }

    @GetMapping("/member/{memberId}")
    public List<Request> getRequestsByMember(@PathVariable Long memberId) {
        return requestRepository.findByMemberId(memberId);
    }

    @PostMapping
    public ResponseEntity<Request> createRequest(@RequestBody Map<String, Object> requestData) {
        Long memberId = Long.valueOf(requestData.get("memberId").toString());
        String description = requestData.get("requestDescription").toString();
        
        return memberRepository.findById(memberId)
                .map(member -> {
                    Request request = new Request();
                    request.setMember(member);
                    request.setRequestDescription(description);
                    return ResponseEntity.ok(requestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Request> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return requestRepository.findById(id)
                .map(request -> {
                    String newStatus = statusUpdate.get("status");
                    request.setStatus(newStatus);
                    if ("COMPLETED".equals(newStatus) || "REJECTED".equals(newStatus)) {
                        request.setCompletedDate(LocalDateTime.now());
                    }
                    if (statusUpdate.containsKey("notes")) {
                        request.setNotes(statusUpdate.get("notes"));
                    }
                    return ResponseEntity.ok(requestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Request> updateRequest(@PathVariable Long id, @RequestBody Request requestDetails) {
        return requestRepository.findById(id)
                .map(request -> {
                    request.setRequestDescription(requestDetails.getRequestDescription());
                    request.setStatus(requestDetails.getStatus());
                    request.setNotes(requestDetails.getNotes());
                    return ResponseEntity.ok(requestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        return requestRepository.findById(id)
                .map(request -> {
                    requestRepository.delete(request);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}